"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spinner = void 0;
const readline_1 = require("readline");
/** ANSI escape code to hide cursor in terminal. */
const hideCursor = '\x1b[?25l';
/** ANSI escape code to show cursor in terminal. */
const showCursor = '\x1b[?25h';
class Spinner {
    constructor(text) {
        this.text = text;
        /** The id of the interval being used to trigger frame printing. */
        this.intervalId = setInterval(() => this.printFrame(), 125);
        /** The characters to iterate through to create the appearance of spinning in the spinner. */
        this.spinnerCharacters = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        /** The index of the spinner character used in the frame. */
        this.currentSpinnerCharacterIndex = 0;
        process.stdout.write(hideCursor);
    }
    /** Get the next spinner character. */
    getNextSpinnerCharacter() {
        this.currentSpinnerCharacterIndex =
            (this.currentSpinnerCharacterIndex % this.spinnerCharacters.length) + 1;
        return this.spinnerCharacters[this.currentSpinnerCharacterIndex - 1];
    }
    /** Print the current text for the spinner to the  */
    printFrame(prefix = this.getNextSpinnerCharacter(), text = this.text) {
        readline_1.cursorTo(process.stdout, 0);
        process.stdout.write(` ${prefix} ${text}`);
        // Clear to the right of the cursor location in case the new frame is shorter than the previous.
        readline_1.clearLine(process.stdout, 1);
        readline_1.cursorTo(process.stdout, 0);
    }
    /** Updates the spinner text with the provided text. */
    update(text) {
        this.text = text;
    }
    /** Completes the spinner. */
    complete() {
        clearInterval(this.intervalId);
        process.stdout.write('\n');
        process.stdout.write(showCursor);
    }
}
exports.Spinner = Spinner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Bpbm5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25nLWRldi91dGlscy9zcGlubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHVDQUE2QztBQUU3QyxtREFBbUQ7QUFDbkQsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDO0FBQy9CLG1EQUFtRDtBQUNuRCxNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUM7QUFFL0IsTUFBYSxPQUFPO0lBUWxCLFlBQW9CLElBQVk7UUFBWixTQUFJLEdBQUosSUFBSSxDQUFRO1FBUGhDLG1FQUFtRTtRQUMzRCxlQUFVLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMvRCw2RkFBNkY7UUFDckYsc0JBQWlCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMvRSw0REFBNEQ7UUFDcEQsaUNBQTRCLEdBQUcsQ0FBQyxDQUFDO1FBR3ZDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxzQ0FBc0M7SUFDOUIsdUJBQXVCO1FBQzdCLElBQUksQ0FBQyw0QkFBNEI7WUFDL0IsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxRSxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVELHFEQUFxRDtJQUM3QyxVQUFVLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSTtRQUMxRSxtQkFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDNUIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQztRQUMzQyxnR0FBZ0c7UUFDaEcsb0JBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdCLG1CQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQsdURBQXVEO0lBQ3ZELE1BQU0sQ0FBQyxJQUFZO1FBQ2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ25CLENBQUM7SUFFRCw2QkFBNkI7SUFDN0IsUUFBUTtRQUNOLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkMsQ0FBQztDQUNGO0FBdkNELDBCQXVDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2N1cnNvclRvLCBjbGVhckxpbmV9IGZyb20gJ3JlYWRsaW5lJztcblxuLyoqIEFOU0kgZXNjYXBlIGNvZGUgdG8gaGlkZSBjdXJzb3IgaW4gdGVybWluYWwuICovXG5jb25zdCBoaWRlQ3Vyc29yID0gJ1xceDFiWz8yNWwnO1xuLyoqIEFOU0kgZXNjYXBlIGNvZGUgdG8gc2hvdyBjdXJzb3IgaW4gdGVybWluYWwuICovXG5jb25zdCBzaG93Q3Vyc29yID0gJ1xceDFiWz8yNWgnO1xuXG5leHBvcnQgY2xhc3MgU3Bpbm5lciB7XG4gIC8qKiBUaGUgaWQgb2YgdGhlIGludGVydmFsIGJlaW5nIHVzZWQgdG8gdHJpZ2dlciBmcmFtZSBwcmludGluZy4gKi9cbiAgcHJpdmF0ZSBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5wcmludEZyYW1lKCksIDEyNSk7XG4gIC8qKiBUaGUgY2hhcmFjdGVycyB0byBpdGVyYXRlIHRocm91Z2ggdG8gY3JlYXRlIHRoZSBhcHBlYXJhbmNlIG9mIHNwaW5uaW5nIGluIHRoZSBzcGlubmVyLiAqL1xuICBwcml2YXRlIHNwaW5uZXJDaGFyYWN0ZXJzID0gWyfioIsnLCAn4qCZJywgJ+KguScsICfioLgnLCAn4qC8JywgJ+KgtCcsICfioKYnLCAn4qCnJywgJ+KghycsICfioI8nXTtcbiAgLyoqIFRoZSBpbmRleCBvZiB0aGUgc3Bpbm5lciBjaGFyYWN0ZXIgdXNlZCBpbiB0aGUgZnJhbWUuICovXG4gIHByaXZhdGUgY3VycmVudFNwaW5uZXJDaGFyYWN0ZXJJbmRleCA9IDA7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB0ZXh0OiBzdHJpbmcpIHtcbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShoaWRlQ3Vyc29yKTtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIG5leHQgc3Bpbm5lciBjaGFyYWN0ZXIuICovXG4gIHByaXZhdGUgZ2V0TmV4dFNwaW5uZXJDaGFyYWN0ZXIoKSB7XG4gICAgdGhpcy5jdXJyZW50U3Bpbm5lckNoYXJhY3RlckluZGV4ID1cbiAgICAgICh0aGlzLmN1cnJlbnRTcGlubmVyQ2hhcmFjdGVySW5kZXggJSB0aGlzLnNwaW5uZXJDaGFyYWN0ZXJzLmxlbmd0aCkgKyAxO1xuICAgIHJldHVybiB0aGlzLnNwaW5uZXJDaGFyYWN0ZXJzW3RoaXMuY3VycmVudFNwaW5uZXJDaGFyYWN0ZXJJbmRleCAtIDFdO1xuICB9XG5cbiAgLyoqIFByaW50IHRoZSBjdXJyZW50IHRleHQgZm9yIHRoZSBzcGlubmVyIHRvIHRoZSAgKi9cbiAgcHJpdmF0ZSBwcmludEZyYW1lKHByZWZpeCA9IHRoaXMuZ2V0TmV4dFNwaW5uZXJDaGFyYWN0ZXIoKSwgdGV4dCA9IHRoaXMudGV4dCkge1xuICAgIGN1cnNvclRvKHByb2Nlc3Muc3Rkb3V0LCAwKTtcbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShgICR7cHJlZml4fSAke3RleHR9YCk7XG4gICAgLy8gQ2xlYXIgdG8gdGhlIHJpZ2h0IG9mIHRoZSBjdXJzb3IgbG9jYXRpb24gaW4gY2FzZSB0aGUgbmV3IGZyYW1lIGlzIHNob3J0ZXIgdGhhbiB0aGUgcHJldmlvdXMuXG4gICAgY2xlYXJMaW5lKHByb2Nlc3Muc3Rkb3V0LCAxKTtcbiAgICBjdXJzb3JUbyhwcm9jZXNzLnN0ZG91dCwgMCk7XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgc3Bpbm5lciB0ZXh0IHdpdGggdGhlIHByb3ZpZGVkIHRleHQuICovXG4gIHVwZGF0ZSh0ZXh0OiBzdHJpbmcpIHtcbiAgICB0aGlzLnRleHQgPSB0ZXh0O1xuICB9XG5cbiAgLyoqIENvbXBsZXRlcyB0aGUgc3Bpbm5lci4gKi9cbiAgY29tcGxldGUoKSB7XG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSWQpO1xuICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKCdcXG4nKTtcbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShzaG93Q3Vyc29yKTtcbiAgfVxufVxuIl19