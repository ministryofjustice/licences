# Updating conditions

Versions of conditions are stored in these folders. 

There are 3 different modules that store information about a specfic version of the set of conditions:

* conditions.ts - stores text, group info and metadata about fields including optional form/field info
* fieldConfig.ts - stores validation message 
* validation.ts - stores schema info
 
 If any change to a condition is required, then a new version will be required - this is because otherwise
 the text of a previously generated licence will change when it is viewed/generated again. 

 The current implementation means that new licences will always see the 'current' version  (see conditionsConfig.ts) until and additional conditions are selected - from that point onwards they
 will only be able to see that version.

 ## Adding new conditions:

* A new `v$n` folder and the set of modules will need to be created
* These will then need to be registered in `conditionsConfig.ts`
* new forms will need to be created in `server/views/licenceConditions/includes` and wired into `server/views/licenceConditions/includes/formBuilder`
* Any required adjustments to forms will require new forms (forms aren't versioned - so to preserve existing behaviour need to create new ones)
* Any multiple answer (checkbox) forms will need to be formatted in `modifyAdditionalConditions` in `conditions.ts` and handling single values will need to be done in a custom `displayForEdit`  
* Any new date fields will need to be added  to `conditionsFormatter.ts` and need a custom `displayForEdit` in `conditions.ts`
* Multifields will need to have joining/formatting rules added to `multiFields` in `conditionsConfig.ts`
* Integration tests may need updating
* The 'current' version in `conditionsConfig.ts` will need to be updated

 


