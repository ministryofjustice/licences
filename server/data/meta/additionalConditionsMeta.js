const meta = new Map();

meta.set('[INSERT NAME]', {
    type: 'FREE_TEXT',
    label: 'Name'
});

meta.set('[INSERT APPOINTMENT TIME DATE AND ADDRESS]', {
    type: 'FREE_TEXT'
});

meta.set('[INSERT NAME OF VICTIM AND / OR FAMILY MEMBERS]', {
    type: 'FREE_TEXT',
    label: 'Names(s) of victim(s) and/or family members'
});

meta.set('[INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT]', {
    type: 'FREE_TEXT',
    label: 'Social services dept'
});

meta.set('[ANY / ANY FEMALE / ANY MALE]', {
    type: 'RADIO',
    options: ['ANY', 'ANY FEMALE', 'ANY MALE']
});

meta.set('[INSERT AGE]', {
    type: 'NUMBER',
    label: 'Age'
});

meta.set('[INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT]', {
    type: 'FREE_TEXT',
    label: 'Name of social services dept'
});

meta.set('[NAMED OFFENDER(S) / NAMED INDIVIDUAL(S)]', {
    type: 'FREE_TEXT',
    label: 'Names'
});

meta.set('[NAME OR DESCRIBE SPECIFIC GROUPS OR ORGANISATIONS]', {
    type: 'FREE_TEXT',
    label: 'Names of groups and/or organisations'
});

meta.set('[NAME OF COURSE / CENTRE]', {
    type: 'FREE_TEXT',
    label: 'Names of course/centre'
});

meta.set('[SPECIFIC ITEMS]', {
    type: 'FREE_TEXT'
});

meta.set('[QUANTITY HERE]', {
    type: 'NUMBER',
    label: 'Quantity'
});

meta.set('[SUCH AS MAKE, MODEL, COLOUR, REGISTRATION]', {
    type: 'FREE_TEXT'
});

meta.set('[WOMEN / MEN / WOMEN OR MEN]', {
    type: 'RADIO',
    options: ['WOMEN', 'MEN', 'WOMEN OR MEN']
});

meta.set('[TIME]', {
    type: 'TIME',
    label: 'Time'
});


meta.set('[WEEKLY / MONTHLY / ETC]', {
    type: 'FREE_TEXT'
});

meta.set('[CURFEW ADDRESS]', {
    type: 'ADDRESS',
    label: 'Curfew address'
});

meta.set('[START OF CURFEW HOURS]', {
    type: 'TIME',
    label: 'From'
});

meta.set('[END OF CURFEW HOURS]', {
    type: 'TIME',
    label: 'To'
});

meta.set('[WHETHER BY ELECTRONIC MEANS INVOLVING YOUR WEARING AN ELECTRONIC TAG OR OTHERWISE]', {
    type: 'SELECT',
    label: 'Electronic tag required'
});

meta.set('[CLEARLY SPECIFIED AREA]', {
    type: 'FREE_TEXT'
});

meta.set('[NAME/TYPE OF PREMISES / ADDRESS / ROAD]', {
    type: 'FREE_TEXT',
    label: 'Name/type of premises / address / road'
});

meta.set('[CHILDREN’S PLAY AREA, SWIMMING BATHS, SCHOOL ETC]', {
    type: 'FREE_TEXT',
    label: 'Restricted places'
});

meta.set('[NAME OF APPROVED PREMISES / POLICE STATION]', {
    type: 'FREE_TEXT',
    label: 'Approved premises/police station address'
});

meta.set('[TIME / DAILY]', {
    type: 'FREE_TEXT',
    label: 'At(time)'
});

meta.set('[in volumes that exceed a specified limit]', {
    type: 'FREE_TEXT'
});

module.exports = meta;
