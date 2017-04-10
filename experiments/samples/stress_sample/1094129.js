/*
    Mooi - jQuery plugin - image slider 
    Copyright (C) 2011  Erik Landvall
    
    This file is part of Mooi.

    Mooi is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see http://www.gnu.org/licenses/.
 */
 
Mooi.Clone.VerticalMotion = function( browseInst )
{
    $.extend(
        this,
        new Mooi.Clone.Abstract( browseInst ));

    // Maiking shore its the right part we see
    this.getTarget().css(
        {
            'position'  : 'absolute',
            'left'      : browseInst.getMooiInst().getLeftOffset() + 'px'
        });

    // positioning the clone on the right place
    this.getViewport().css(
        {
            'width'     : browseInst.getMooiInst().getViewport().width(),
            'height'    : browseInst.getMooiInst().getTarget().height(),
            'position'  : 'absolute',
            'left'      : browseInst.getMooiInst().getLeftDisproportion() + 'px'
        });
}
