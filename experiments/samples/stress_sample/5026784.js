define(["dojo/_base/declare"], function(declare) {
    return declare(null, {
        LINES_IN_PAGE: 12,
        remaining_lines: [],
        ikog: undefined,
        constructor: function(lines) {
            this.remaining_lines = lines;
            this.print_once();
            ikog.install_command_handler(this);
        },
        dump_state: function() {
            console.log("LINES_IN_PAGE", this.LINES_IN_PAGE);
            console.log("remaining_lines", this.remaining_lines);
        },
        print_once: function() {
            var lines = this.remaining_lines;
            this.remaining_lines = lines.slice(this.LINES_IN_PAGE);
            var lines_to_display = lines.slice(0, this.LINES_IN_PAGE);
            for (i=0; i < lines_to_display.length; i++)
            {
                ikog.println(lines_to_display[i]);
            }
            if (!this.done())
                ikog.println("--- Press enter for more. Enter s to skip ---")
        },
        done: function() {
            return this.remaining_lines.length == 0;
        },
        handle_command: function(line) {
            if (line == "s") {
                ikog.println("Skipped.");
                ikog.reset_command_handler();
                return;
            }
            this.print_once();
            if (this.done()) ikog.reset_command_handler();
        }
    })
});