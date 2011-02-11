
var framebuffer = {};
(function (that)
{
    'use strict';

    var ascii = [];

    var base = 0xb8000;

    var slotslen = 80 * 25;
    var len      = slotslen * 2;

    var mem   = new Array(len);
    var slots = new Array(slotslen);

    var colors = [
        'black', 'blue', 'green', 'cyan', 'red', 'magenta', 'brown', 'light grey',
        'dark grey', 'light blue', 'light green', 'light cyan', 'light red', 'light magneta', 'light brown', 'white'
    ];

    function setAscii()
    {
        ascii[32] = ' ';
        ascii[33] = '!';
        ascii[34] = '"';
        ascii[35] = '#';
        ascii[36] = '$';
        ascii[37] = '%';
        ascii[38] = '&';
        ascii[39] = '\'';
        ascii[40] = '(';
        ascii[41] = ')';
        ascii[42] = '*';
        ascii[43] = '+';
        ascii[44] = ',';
        ascii[45] = '-';
        ascii[46] = '.';
        ascii[47] = '/';
        ascii[48] = '0';
        ascii[49] = '1';
        ascii[50] = '2';
        ascii[51] = '3';
        ascii[52] = '4';
        ascii[53] = '5';
        ascii[54] = '6';
        ascii[55] = '7';
        ascii[56] = '8';
        ascii[57] = '9';
        ascii[58] = ':';
        ascii[59] = ';';
        ascii[60] = '<';
        ascii[61] = '=';
        ascii[62] = '>';
        ascii[63] = '?';
        ascii[64] = '@';
        ascii[65] = 'A';
        ascii[66] = 'B';
        ascii[67] = 'C';
        ascii[68] = 'D';
        ascii[69] = 'E';
        ascii[70] = 'F';
        ascii[71] = 'G';
        ascii[72] = 'H';
        ascii[73] = 'I';
        ascii[74] = 'J';
        ascii[75] = 'K';
        ascii[76] = 'L';
        ascii[77] = 'M';
        ascii[78] = 'N';
        ascii[79] = 'O';
        ascii[80] = 'P';
        ascii[81] = 'Q';
        ascii[82] = 'R';
        ascii[83] = 'S';
        ascii[84] = 'T';
        ascii[85] = 'U';
        ascii[86] = 'V';
        ascii[87] = 'W';
        ascii[88] = 'X';
        ascii[89] = 'Y';
        ascii[90] = 'Z';
        ascii[91] = '[';
        ascii[92] = '\\';
        ascii[93] = ']';
        ascii[94] = '^';
        ascii[95] = '_';
        ascii[96] = '`';
        ascii[97] = 'a';
        ascii[98] = 'b';
        ascii[99] = 'c';
        ascii[100] = 'd';
        ascii[101] = 'e';
        ascii[102] = 'f';
        ascii[103] = 'g';
        ascii[104] = 'h';
        ascii[105] = 'i';
        ascii[106] = 'j';
        ascii[107] = 'k';
        ascii[108] = 'l';
        ascii[109] = 'm';
        ascii[110] = 'n';
        ascii[111] = 'o';
        ascii[112] = 'p';
        ascii[113] = 'q';
        ascii[114] = 'r';
        ascii[115] = 's';
        ascii[116] = 't';
        ascii[117] = 'u';
        ascii[118] = 'v';
        ascii[119] = 'w';
        ascii[120] = 'x';
        ascii[121] = 'y';
        ascii[122] = 'z';
        ascii[123] = '{';
        ascii[124] = '|';
        ascii[125] = '}';
        ascii[126] = '~';
    }

    var outb_command, outb_14, outb_15, cursor_x = 0, cursor_y = 0;
    that.outb = function (port, val)
    {
        var sloffset;

        if (port === 0x3D4)
        {
            outb_command = val;
        }
        else if (port === 0x3D5)
        {
            if (outb_command === 14)
            {
                outb_14 = val;
            }
            else if (outb_command === 15)
            {
                outb_15 = val;

                sloffset = (outb_14 << 8) + outb_15;

                slots[(cursor_y * 80) + cursor_x].style.textDecoration = '';

                cursor_x = sloffset % 80;
                cursor_y = (sloffset - cursor_x) / 80;
                slots[(cursor_y * 80) + cursor_x].style.textDecoration = 'underline';
            }
        }
    };

    that.hasb = function (addr)
    {
        return (addr >= base) && (addr < (base + len));
    };

    that.setb = function (addr, val)
    {
        var offset, sloffset, slot;

        offset = addr - base;

        if (mem[offset] === val)
        {
            return;
        }

        if ((offset % 2) === 0)
        {
            mem[offset] = val;
            sloffset = offset / 2;
            slots[sloffset].firstChild.nodeValue = ascii[val];
        }
        else
        {
            mem[offset] = val;
            sloffset = (offset - 1) / 2;
            slot = slots[sloffset];

            slot.style.color = colors[val & 0x0F];;
            slot.style.backgroundColor = colors[val >> 4];

            var cx = sloffset % 80;
            var cy = (sloffset - cx) / 80;

            if ((cursor_x === cx) && (cursor_y === cy))
            {
                slot.style.textDecoration = 'underline';
            }
        }
    };

    that.getb = function (addr)
    {
        return mem[addr];
    };

    that.init = function ()
    {
        var el = document.createElement('div');
        var slot, node, row;
        var i, j;

        setAscii();

        i = len;
        while (i !== 0)
        {
            mem[--i] = 0x0F; /* the attribute (white on black) */
            mem[--i] = 32;   /* the character (space) */
        }

        i = 0;
        while (i !== slotslen)
        {
            row = document.createElement('div');
            row.style.fontFamily = 'monospace';

            j = 0;
            while (j !== 80)
            {
                slot = document.createElement('div');
                slot.style.display = 'inline';
                slot.style.whiteSpace = 'pre';
                slot.style.fontFamily = 'monospace';
                slot.style.color = 'white';
                slot.style.backgroundColor = 'black';
                node = document.createTextNode(' ');
                slot.appendChild(node);
                row.appendChild(slot);
                slots[i++] = slot;
                ++j;
            }
            el.appendChild(row);
        }

        // The cursor starts at position zero
        slots[0].style.textDecoration = 'underline';

        document.body.appendChild(el);
    };

}(framebuffer));

var memory = {};
(function (that)
{
    'use strict';

    that.hasb = function (addr)
    {
        return framebuffer.hasb(addr);
    };

    that.setb = function (addr, val)
    {
        if (framebuffer.hasb(addr))
        {
            framebuffer.setb(addr, val);
        }
    };

    that.getb = function (addr)
    {
        if (framebuffer.hasb(addr))
        {
            return framebufer.getb(addr);
        }
        return 0;
    };

}(memory));
