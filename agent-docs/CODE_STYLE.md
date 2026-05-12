# CODING STYLE

## BACKEND

Business logic always goes in it's own folder, like <relevant-module>/<backend>/<functions/types/schema>. This then gets called in the relevant api implementation by the next.js router.
API inputs always get validated before processing. They are to go in <relevant-module>/<backend>/<input-schemas>, and then imported in the router for validation.

## FRONTEND

View logic goes in it's own folder <relevant-module>/<frontend>/<view-logic-name>/<components/forms/hooks/functions>, this then gets called in the relevant page in the next.js router.
view logic's function goes in it's function folder, like <relevant-module>/<frontend>/<view-logic-name>/<functions>/<view-logic-function-name.function.ts>, keep maximum view logic there
create hooks like <relevant-module>/<frontend>/<view-logic-name>/<hooks>/<view-logic-hook-name.hook.ts> with the part necessarily to be put in a hook

## GENERAL

Only the part that cannot be out of the framework (next.js) would follow next.js folder structure, other implementation belongs in the module folder.
In case of multiple code implementations, choose the most human readable one.
Try to keep file sizes below 100 lines
Do not use any as type

### NAMING

variable names must be in camelCase.
variable names must always be maximally explanatory.

### FILE NAMING

schema and database model file name go like this <file-name.schema.ts>
hooks go like <hook-name.hook.ts>
functions go like <hook-name.function.ts>
api call functions go like <api-call.api.ts>
components go like <component-name.component.ts>
type names go liek <type-name.type.ts>
