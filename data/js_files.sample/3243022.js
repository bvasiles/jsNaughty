/*
 * Copyright (c) 2013 Carl-Anton Ingmarsson <carlantoni@gnome.org>
 *
 * Gnome To Do is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by the
 * Free Software Foundation; either version 2 of the License, or (at your
 * option) any later version.
 *
 * Gnome To Do is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with Gnome To Do; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 * Author: Carl-Anton Ingmarsson <carlantoni@gnome.org>
 *
 */

const GObject = imports.gi.GObject;
const Gd = imports.gi.Gd;
const GdPrivate = imports.gi.GdPrivate;
const Gdk = imports.gi.Gdk;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;

const Lang = imports.lang;
const Signals = imports.signals;

const Config = imports.config;
const DatePicker = imports.datePicker;
const Global = imports.global;
const MainController = imports.mainController;
const Utils = imports.utils;

const ListEditorController = new Lang.Class({
    Name: 'ListEditorController',
    Extends: MainController.Controller,

    _init: function(mainController, list) {
        this.parent(mainController);

        this._list = list;

        this._initActions();

        this._toolbar = new ListEditorToolbar(list.title);
        this._toolbar.connect('back-button-clicked',
            Lang.bind(this, this._backButtonClicked));

        let source = Global.sourceManager.getItemById(list.source.id);
        this._view = new ListEditorView(source, list, this.window, this._actions);

        list.forEachItem(Lang.bind(this, function(task) {
            this._view.addItem(task);
        }));
        list.connect('item-removed',
            Lang.bind(this, this._taskRemoved));
    },

    _initActions: function() {
        let actionEntries = [
            {
                name: 'list-editor.save',
                callback: this._save,
                enabled: false
            },
            {
                name: 'list-editor.delete',
                callback: this._delete,
                enabled: true
            },
            {
                name: 'list-editor.new',
                callback: this._new,
                enabled: true
            }];

        this._actions = Utils.createActions(this, actionEntries);
    },

    activate: function() {
        Utils.addActions(this.window, this._actions);

        this.window.setToolbarWidget(this._toolbar);
    },

    deactivate: function() {
        Utils.removeActions(this.window, this._actions);

        this.window.setToolbarWidget(null);
    },

    getView: function() {
        return this._view;
    },

    onCancel: function() {
        if (this._view.activeItem != null) {
            this._view.listBox.select_row(null);
            return;
        }

        this.mainController.popController();
    },

    _backButtonClicked: function(toolbar) {
        this.mainController.popController();
    },

    _taskRemoved: function(list, task) {
        let item = this._view.getItemForTask(task);
        if (item)
            this._view.removeItem(item);
    },

    _save: function(saveAction, parameter) {
        let listItem = this._view.activeItem;
        // Create a new task if the listItem doesn't have a task yet.
        if (!listItem.getTask()) {
            let task = this._list.createTask(listItem.title,
                listItem.completedDate, listItem.dueDate, listItem.note);
            listItem.setTask(task);
        }
        // Update the task otherwise
        else {
            let task = listItem.getTask();

            if (listItem.listModified) {
                // Remove task from old list
                task.list.deleteTask(task.id);

                // Create a new task in the new list
                listItem.list.createTask(listItem.title,
                    listItem.completedDate, listItem.dueDate, listItem.note);
            }
            else {
                task.freezeChanged();
                if (listItem.titleModified)
                    task.title = listItem.title;
                if (listItem.completedDateModified)
                    task.completedDate = listItem.completedDate;
                if (listItem.noteModified)
                    task.notes = listItem.note;
                if (listItem.dueDateModified)
                    task.dueDate = listItem.dueDate;
                task.thawChanged();

                listItem.setTask(task);
            }
        }
    },

    _delete: function(deleteAction, parameter) {
        let listItem = this._view.activeItem;
        let task = listItem.getTask();

        if (task)
            this._list.deleteTask(task.id);
        else
            this._view.removeItem(listItem);
    },

    _new: function(newAction, parameter) {
        let newItem = this._view.addItem(null);
        this._view.listBox.select_row(newItem);
    }
});

const ListEditorView = new Lang.Class({
    Name: 'ListEditorView',
    Extends: Gtk.Paned,

    _init: function(source, list, actionGroup, actions) {
        this.parent({ orientation: Gtk.Orientation.HORIZONTAL });

        this._source = source;
        this._list = list;
        this._actionGroup = actionGroup;
        this._actions = actions;

        this._selectedRow = null;

        this.listBox = new Gtk.ListBox();
        this.listBox.show();
        this.pack1(this.listBox, true, false);

        this.taskEditor = new TaskEditor(source, actionGroup);
        this.pack2(this.taskEditor, false, false);
        this.taskEditor.reveal_child = false;

        this.taskEditor.connect('cancelled',
            Lang.bind(this, this._taskEditorCancelled));

        this.listBox.set_sort_func(
            Lang.bind(this, this._listBoxSortFunc));
        this.listBox.set_header_func(
            Lang.bind(this, this._listBoxSetHeaderFunc));

        this.listBox.connect('row-selected',
            Lang.bind(this, this._rowSelected));

        this.listBox.add(new NewListItem(actionGroup));

        this.show();
    },

    get activeItem() {
        return this._selectedRow;
    },

    addItem: function(task) {
        let listItem = new ListItem(this._list, this, task);
        this.listBox.add(listItem);

        let saveCheck = function(item) {
            if (item != this._selectedRow)
                return;

            let saveEnabled = item.title && item.modified;
            this._actions['list-editor.save'].enabled = saveEnabled;
        };

        listItem.connect('notify::modified', Lang.bind(this, saveCheck));
        listItem.connect('notify::title', Lang.bind(this, saveCheck));

        return listItem;
    },

    removeItem: function(listItem) {
        let index = listItem.get_index(listItem);
        if (index == -1)
            return;

        this.listBox.remove(listItem);

        let row = this.listBox.get_row_at_index(index);
        if (row != null && !row.isNewListItem)
            this.listBox.select_row(row);
    },

    getItemForTask: function(task) {
        let listItems = this.listBox.get_children();
        for (let i = 0; i < listItems.length; i++) {
            let listItem = listItems[i];

            if (listItem.isNewListItem)
                continue;

            if (listItem.getTask() && listItem.getTask().id == task.id)
                return listItem;
        }
        return null;
    },

    _listBoxSortFunc: function(item1, item2) {
        if (item1.isNewListItem)
            return 1;
        if (item2.isNewListItem)
            return -1;

        if (item1.position < item2.position)
            return -1;
        if (item1.position > item2.position)
            return 1;

        return 0;
    },

    _listBoxSetHeaderFunc: function(row, before) {
        if (before != null)
            row.set_header(new Gtk.Separator());
    },

    _rowSelected: function(listBox, row) {
        if (this._selectedRow)
            this._selectedRow.deactivate(this);

        let saveEnabled = false;
        if (row != null && !row.isNewListItem) {
            saveEnabled = row.title && row.modified;
        }
        this._actions['list-editor.save'].enabled = saveEnabled;

        this._selectedRow = row;
        if (row != null)
            row.activate(this);
    },

    _taskEditorCancelled: function(taskEditor) {
        if (this._selectedRow != null) {
            let task = this._selectedRow.getTask();
            if (task)
                this._selectedRow.setTask(task);
            else
                this.removeItem(this._selectedRow);
        }
        this.listBox.select_row(null);
    }
});

const ListItem = new Lang.Class({
    Name: 'ListItem',
    Extends: Gtk.ListBoxRow,

    Properties: {
        'modified': GObject.ParamSpec.boolean('modified', 'Modified',
            'If item has been modified', GObject.ParamFlags.READABLE, false),
        'title': GObject.ParamSpec.string('title', 'Title',
            'The title of the item', GObject.ParamFlags.READABLE, '')
    },

    _init: function(list, listEditor, task) {
        this.parent();

        this._list = list;
        this._listEditor = listEditor;

        this.isNewListItem = false;
        this.active = false;

        this._modified = false;
        this._titleModified = false;
        this._completedModified = false;
        this._noteModified = false;
        this._dueDateModified = false;
        this._listModified = false;

        this._completedDate = null;
        this._note = '';
        this._dueDate = null;
        this._task = null;

        let builder = new Gtk.Builder();
        builder.add_from_resource('/org/gnome/todo/ui/list_item.glade');
        this.add(builder.get_object('grid'));

        this._doneCheck = builder.get_object('done_check');
        this._doneCheck.connect('toggled', Lang.bind(this, this._doneCheckToggled));

        this._titleNotebook = builder.get_object('title_notebook');
        this._titleLabel =  builder.get_object('title_label');
        this._titleLabel.label = '';

        this._titleEntry = builder.get_object('title_entry');
        this._titleEntry.connect('changed',
            Lang.bind(this, this._titleEntryChanged));

        this._dueLabel = builder.get_object('due_label');
        this._dueLabel.label = '';

        this._noteNotebook = builder.get_object('note_notebook');
        this._noteNotebook.page = 1;

        if (task)
            this.setTask(task);

        this.show();
    },

    setTask: function(task) {
        if (this._task)
            this._task.disconnect(this._taskChangedID);

        this._task = task;
        this._taskChangedID = this._task.connect('changed',
            Lang.bind(this, this._taskChanged));

        this._taskChanged(task);
    },

    _taskChanged: function(task) {
        this._titleModified = false;
        this._completedModified = false;
        this._noteModified = false;
        this._dueDateModified = false;
        this._listModified = false;
        if (this._modified) {
            this._modified = false;
            this.notify('modified');
        }

        this._doneCheck.active = task.completedDate ? true : false;
        this._completedDate = task.completedDate;
        this._completedDateChanged();

        this.note = task.notes ? task.notes : '';

        this.dueDate = task.dueDate;

        this._titleLabel.label = task.title;
        this._titleEntry.text = task.title;
        this._titleEntryChanged(this._titleEntry);

        if (this.active)
            this._listEditor.taskEditor.setListItem(this);
    },

    getTask: function() {
        return this._task;
    },

    activate: function(listEditor) {
        this.active = true;

        this._titleNotebook.set_current_page(1);

        listEditor.taskEditor.setListItem(this);
        listEditor.taskEditor.reveal_child = true;

        //Gd.entry_focus_hack(this._titleEntry);
        this.grab_focus();
        //this._doneCheck.grab_focus();
    },

    deactivate: function(listEditor) {
        this.active = false;

        this._titleNotebook.set_current_page(0);
        listEditor.taskEditor.reveal_child = false;

        if (this._task == null && !this._modified) {
            listEditor.listBox.remove(this);
        }
    },

    get modified() {
        return this._modified;
    },

    get titleModified() {
        return this._titleModified;
    },

    get completedDateModified() {
        return this._completedModified;
    },

    get noteModified() {
        return this._noteModified;
    },

    get dueDateModified() {
        return this._dueDateModified;
    },

    get listModified() {
        return this._listModified;
    },

    get title() {
        if (!this._titleEntry)
            return null;

        return this._titleEntry.text;
    },

    get completedDate() {
        if (!this._doneCheck)
            return null;

        if (!this._doneCheck.active)
            return null;

        if (this._task && this._task.completedDate)
            return this._task.completedDate;
        else
            return this._completedDate;
    },

    get note() {
        return this._note;
    },

    set note(note) {
        if (this._note != note) {
            this._note = note;

            let noteModified;
            if (this._task)
                noteModified = (note != this._task.notes);
            else
                noteModified = note != '';

            if (noteModified != this._noteModified) {
                this._noteModified = noteModified;
                this._checkModified();
            }

            if (this._noteNotebook) {
                if (note)
                    this._noteNotebook.page = 0;
                else
                    this._noteNotebook.page = 1;
            }
        }
    },

    get dueDate() {
        return this._dueDate;
    },

    set dueDate(dueDate) {
        if (!GdPrivate.date_time_equal(this._dueDate, dueDate)) {
            this._dueDate = dueDate;

            let taskDueDate = this._task ? this._task.dueDate : null;
            let modified = !GdPrivate.date_time_equal(this._dueDate, taskDueDate);
            if (modified != this._dueDateModified) {
                this._dueDateModified = modified;
                this._checkModified();
            }

            if (this._dueLabel) {
                if (dueDate)
                    this._dueLabel.label = dueDate.formatForDisplay();
                else
                    this._dueLabel.label = '';
            }
        }
    },

    get list() {
        return this._list;
    },

    set list(list) {
        if (this._list != list) {
            this._list = list;

            let modified;
            if (this._task)
                modified = this._task.list != list;
            else
                modified = list != null;
            if (modified != this._listModified) {
                this._listModified = modified;
                this._checkModified();
            }
        }
    },

    _titleEntryChanged: function(entry) {

        this._titleLabel.label = entry.text;

        let titleModified;
        if (this._task)
            titleModified = (entry.text != this._task.title);
        else
            titleModified = entry.text != '';

        if (titleModified != this._titleModified) {
            this._titleModified = titleModified;
            this._checkModified();
        }

        this.notify('title');
    },

    _doneCheckToggled: function(doneCheck) {
        if (doneCheck.active) {
            let taskCompletedDate = this._task ? this._task.completedDate : null;
            if (taskCompletedDate)
                this._completedDate = taskCompletedDate;
            else
                this._completedDate = GLib.DateTime.new_now_utc();
        }
        else
            this._completedDate = null;

        this._completedDateChanged();
    },

    _completedDateChanged: function() {
        let taskCompletedDate = this._task ? this._task.completedDate : null;

        let modified = !GdPrivate.date_time_equal(this._completedDate, taskCompletedDate);
        if (modified != this._completedModifed) {
            this._completedModified = modified;
            this._checkModified();
        }
    },

    _checkModified: function() {
        let modified =
            this._titleModified ||
            this._completedModified ||
            this._noteModified ||
            this._dueDateModified ||
            this._listModified;

        if (modified != this._modified) {
            this._modified = modified;
            this.notify('modified');
        }
    }
});

const NewListItem = new Lang.Class({
    Name: 'NewListItem',
    Extends: Gtk.ListBoxRow,

    _init: function(actionGroup) {
        this.parent();

        this.isNewListItem = true;
        this._actionGroup = actionGroup;

        let builder = new Gtk.Builder();
        builder.add_from_resource('/org/gnome/todo/ui/new_list_item.glade');
        this.add(builder.get_object('grid'));

        this.show();
    },

    activate: function(listEditor) {
        this._actionGroup.activate_action('list-editor.new', null);
    },

    deactivate: function() {
    }
});

const LIST_COMBO_COLUMN_TITLE = 0;
const LIST_COMBO_COLUMN_ID    = 1;

const TaskEditor = new Lang.Class({
    Name: 'TaskEditor',
    Extends: Gtk.Revealer,

    Signals: {
        'cancelled': {}
    },

    _init: function(source, actionGroup) {
        this.parent({ transition_type: Gtk.RevealerTransitionType.SLIDE_LEFT });

        let builder = new Gtk.Builder();
        builder.add_from_resource('/org/gnome/todo/ui/task_editor.glade');
        this._taskEditor = builder.get_object('task_editor');
        this.add(this._taskEditor);
        this.show_all();

        this._noteBuffer = builder.get_object('note_textbuffer');
        this._noteBuffer.connect('changed', Lang.bind(this, this._noteBufferChanged));

        this._listCombo = builder.get_object('list_combo');
        this._listCombo.connect('changed', Lang.bind(this, this._listComboChanged));
        this._listStore = builder.get_object('list_store');

        let dueDatePlaceholder = builder.get_object('due_date_placeholder');
        this._dueDatePicker = new DatePicker.DatePicker();
        dueDatePlaceholder.add(this._dueDatePicker);
        this._dueDatePicker.connect('date-changed', Lang.bind(this, this._dueDateChanged));

        let deleteButton = builder.get_object('delete_button');
        deleteButton.connectClickedToAction(actionGroup, 'list-editor.delete');

        let cancelButton = builder.get_object('cancel_button');
        cancelButton.connect('clicked', Lang.bind(this, function(button) {
            this.emit('cancelled');
        }));

        let saveButton = builder.get_object('save_button');
        saveButton.connectSensitiveToAction(actionGroup, 'list-editor.save');
        saveButton.connectClickedToAction(actionGroup, 'list-editor.save');

        this._setSource(source);
    },

    setListItem: function(listItem) {
        this._listItem = listItem;

        this._noteBuffer.text = listItem.note;
        this._dueDatePicker.setDate(listItem.dueDate);

        let iter = this._getIterFromListID(listItem.list.id);
        this._listCombo.set_active_iter(iter);
    },

    _setSource: function(source) {
        this._source = source;

        source.forEachItem(Lang.bind(this, function(list) {
            this._listAdded(source, list);
        }));
        source.connect('item-added', Lang.bind(this, this._listAdded));
        source.connect('item-updated', Lang.bind(this, this._listUpdated));
        source.connect('item-removed', Lang.bind(this, this._listRemoved));
    },

    _listAdded: function(source, list) {
        let iter = this._listStore.append();
        this._listStore.set_value(iter, LIST_COMBO_COLUMN_ID, list.id);
        this._listStore.set_value(iter, LIST_COMBO_COLUMN_TITLE, list.title);
    },

    _listUpdated: function(source, list) {
        let iter = this._getIterFromListID(list.id);
        this._listStore.set_value(iter, LIST_COMBO_COLUMN_TITLE, list.title);
    },

    _listRemoved: function(source, list) {
        let iter = this._getIterFromListID(list.id);
        this._listStore.remove(iter);
    },

    _listComboChanged: function(listCombo) {
        if (!this._listItem)
            return;

        let activeListID = listCombo.get_active_id();
        let activeList = this._source.getItemById(activeListID);
        this._listItem.list = activeList;
    },

    _getIterFromListID: function(listID) {
        for (let [res, iter] = this._listStore.get_iter_first();
            res;
            res = this._listStore.iter_next(iter))
        {
            let id = this._listStore.get_value(iter, LIST_COMBO_COLUMN_ID);
            if (id == listID)
                return iter;
        }
        return null;
    },

    _noteBufferChanged: function(buffer) {
        this._listItem.note = buffer.text;
    },

    _dueDateChanged: function(datePicker) {
        this._listItem.dueDate = datePicker.getDate();
    }
});

const ListEditorToolbar = new Lang.Class({
    Name: 'ListEditorToolbar',
    Extends: Gtk.Bin,

    _init: function(title) {
        this.parent();

        let builder = new Gtk.Builder();
        builder.add_from_resource('/org/gnome/todo/ui/list_editor_toolbar.glade');
        this._headerBar = builder.get_object('header-bar');
        this.add(this._headerBar);
        this.show();

        let backButton = builder.get_object('back-button');
        backButton.connect('clicked',
            Lang.bind(this, function(button) {
                this.emit('back-button-clicked')
            }));

        let sendButton = builder.get_object('send-button');
        sendButton.connect('clicked',
            Lang.bind(this, function(button) {
                this.emit('send-button-clicked')
            }));

        this._headerBar.title = title;
    },

    setTitle: function(title) {
        this._headerBar.title = title;
    },

    setToolbar: function(mainToolbar) {
        this._mainToolbar = mainToolbar;
    }
});
Signals.addSignalMethods(ListEditorToolbar.prototype);