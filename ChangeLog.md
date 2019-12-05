
- TODO geo type: also allow text-based editing of the value?
- TODO add Duration type  
- TODO replicate undoParameter handling in other relevant components
- TODO edit argument units

2019-12

- add "capabilities" to executor, in particular to indicate `usesUnits`
- 0.3.1: adding units to data model
  For now, only read-only as they are retrieved from TethysDash
- capture defaultUnits when importing REST0 provider info
- simplify routes a bit (eg `/mt` instead of `/missiontpls`)

2019-11
- starting adjs with tethysdash as mxm provider
  
- add $createMxmProvideClient to modularize interaction with external provider
- add "units" to model: defaultUnits in parameter and and paramUnits in argument
- remove unused geometry in mission table
- add options to delete: asset, asset class, mission template
- label for parameter-value
- more adjs to parameter-value editing handling    
- simplify parameter-value dispatch: only edit-popup if editing OR geo type
- expandable mxm-markdown
- allow to revert to default value (both simple and geo types)
- add option to delete a parameter     
- handle edit dispatch through parameter-value
- check for args with error before validating or running the mission
  against executor system
- more handling involving LineString, Polygon, boolean
- factor out breadcrumbs dispatch
- handle editing in mxm-markdown
- add mxmVal module for validating parameter values according to given
  type, and for conversion of simplified "geo-types" to and from GeoJSON.
- add parameter-value and some validation logic
- add parameter-type-select
- adjs re adding new entry
- add mxmConfig boot
- adjustments for "dynamic" configuration loading so it accommodates both local
  development/testing (config loaded from `src/statics/config/config.json`) 
  and docker release (loaded from indicated directory, via mapped volume).
  Configuration now captures graphqlUri, learnMoreUrl and googleApiKey
- style adjustments
  
- propagating geometry edits, still based on adhoc simple format
  externally (internally, always geojson is used)
  TODO determine concrete format for "simplified geo types"

- fix apollo's refetch() not actually refetching
  (this was working just fine before).
  
    The fix:
    - upgraded all apollo stuff (as a general good thing to do)
    - but this was not enough
    - had to add `fetchPolicy: 'no-cache'`
      Why the need for this for **refetch** calls??
      TODO revisit the cache/fetch settings.

- more q-popup-edit adjs related with mxm-markdown. TODO factor out into some mxm-markdown-edit
- use @keyup.enter.stop on multiline inputs under q-popup-edit.
  https://quasar.dev/vue-components/popup-edit#Textarea-%2F-QEditor

- starting to use qgeomap
- upgrading to Quasar 1
- factoring out and extending geometry viewing/editing into qgeomap, a separate quasar extension


2019-09

- do pending mxms to mxm renaming
- some notes about revisiting prisma (but not choosing it after all)

2019-08-15

- use postgraphile:4
- use --export-schema-graphql option, the idea being
  to later on generate client code based on the schema

2019-04-19 0.2.1

- link to documentation
- renaming to "mxm" (only for externally visible elements)
- favicon

2019-03-28 0.2.0

- complete "pxs" to "mxms" renaming
- general user-visible "pxs" to "mxms" renaming to reflect corresponding changes in the
  spec document related with avoiding the "planning" term in the title of the project

2019-01-14 0.1.0

- describe proxy-pass on 'tsauv' for the enabled TSAUV Front Tracking
  REST endopoint.

2019-01-10 0.1.0

- make home page be the list of executors, and remove 'executors/' prefix in routes

2018-12-20 0.0.9

- position-table: use `q-tr` to associate mouse handlers to whole row

2018-12-19 0.0.8

- complete 0.0.8 release
- stringify defaultValue if given when inserting parameter
- rename project to 'pxs' (from 'pxs-ui')

2018-12-14 0.0.8

- initial preparations to edit geometries
    - new geojson-input component to handle display and editing
    - inclusion of position-table
    - incorporate leaflet-draw
    - focusing on point, multipoint and polygon
      TODO having issue with editing polygon: 1st edit reflected OK but
      subsequent ones seem out-of-sync with the handlers shown by leaflet-draw
      unless a previous cancel is performed.
    - emitting 'input' from geojson-input
    - use parameter-value-input in MissionTpl (readonly for now) and Parameter
    - follow GeoJSON in that type names are case-sensitive
    - for now, in 'Add Parameter' dialog, restricting parameter type to:
        'float', 'integer', 'boolean', 'string', 'Point', 'MultiPoint', 'Polygon'

- save mission arguments right upon value change
- minor code cleanup

2018-12-06 0.0.7

- dev convenience: shift-click to delete executor with no confirmation
- running promises in sequence in an attempt to honor the order
  of entities as reported from external rest0 executor.
  However, for some reason this is not having visible effect

2018-12-05 0.0.7

- add parameter-value-input component
  still preliminary

- "mission definition" to "mission template" general renaming

2018-12-04 0.0.6

- check mission status against external executor.
  As a convenience, have the mission return to the DRAFT status
  when the response indicates a "No such mission" error. Reason is
  that the TFT prototype currently only keeps one ongoing running mission.

- initial mission execution and deletion
- some style adjs (markdown, tooltips, logo)

2018-12-03 0.0.6

- open mission route right upon mission creation

2018-12-01 0.0.6

- missions primary key is now: (executor_id, mission_def_id, mission_id)

2018-11-28 0.0.5

- add `<pxs-markdown>` to unify display of descriptions
- preparations for mission actions against the external executor endpoint:
      - validate, run, cancel, check status; delete...
- ad hoc appInfo plugin (for now only to display version)
- add `missionStatus` attribute to mission
  with preliminary enum values

2018-11-28 0.0.4

TODO process promises in sequence

- complete creation of all associated entities for a new "REST0" executor

2018-11-27 0.0.4

- preliminary rest0 plugin to interact with REST0 executor endpoint,
  initially to populate entities (missionTpls, assetsClasses, ...)
- executor now has an `apiType` attribute.
  Two possible values at the moment:
    - `REST0`: simple REST based API
    - `GRAPHQL`: More sophisticated GraphQL interface (specific TBD)

  Idea is to continue experimenting with `REST0` for the TFT executor

- Executors: allow to delete executor
- set `on update cascade on delete cascade` on all foreign keys
- minor adjustments in data tables:
    - missions: remove `name` from
    - parameters: rename `name` to `paramName`

2018-11-20 0.0.3

- set `--classic-ids` so Postgraphile uses `id` (as mandated by the Relay spec) instead of `nodeId`

- a fix and some removals

2018-11-13

TODO: review contraint about deleting a missionTpl's assetClass
  if there are mission instance referring to corresp asset instance

- model change: asset_classes and assets now associated with executor.
  The general simplifying idea is that all entities be executor specific.

  This aligns better with enabling a given actual executor
  (e.g., TethysDash) to expose all its associated definitions
  in a more "self-contained" fashion. That is, pxs-ui could
  eventually serve as a frontend to expose PXS functionality
  supported by (an expanded form of) the TethysDash API.

- mission-new-button: use executorId passed from Missions page
- adjustment in apollo.js to indicate `uri` for regular
  dockerized release, and for local development
- docker related adjustments while deploying on tsauv
    - PXS at      http://tsauv.shore.mbari.org/pxs/
    - graphiql at http://tsauv.shore.mbari.org/pxs-graphiql

2018-11-12

- organize routes so missionTpls and missions are shown under Executor
- fix mission-new-button to show list of assets of selected asset class
- parameter: allow to change name (if foreign key constraints allow)
- missionTpl: Allow to change missionTplId, but note that this is possible
  only when there are no dependencies (foreign key constraints)
- link to parameter in argument table
- simplify executor page: just show id and description of missionTpls
- update executor's description and httpEndpoint
- update missionTpl description

2018-11-09

- add page for parameter

2018-11-08

- add filter to various tables
- pages for asset and asset list
- update assetClass description
- add description component
- mission: show asset class
- update mission description
- some minor adjustments while reviewing after vacation

2018-10-15

- dockerize pxs-ui. Now, all components can be launched via docker-compose


2018-10-12

- model renaming: from "task" to "mission"
- model simplification: remove "plan"

- task dispatch:
    - has an "argument" table with all parameters
    - displayed values as given in explicit arguments or from defaultValue
    - 'Save' button to update arguments so only the overridden
      parameters are saved as arguments

  TODO concept of task status, task submission, etc

2018-10-11

- update quasar-framework to 0.17.17 (CLI 0.17.20)
- assetClasses now only associated with tasksDefs
- remove axios
- more on task and argument dispatch
- more on plan and task dispatch
- expose Asset Classes and Asset Class page

2018-10-10

- adjusting dispatch for plans and tasks
- initial dispatch of taskDefs

- adjusting queries/mutations per execution of `postgraphile` as follows:

      postgraphile -c postgresql://pxs@localhost:25432/pxs --schema public -o --simple-collections only

   TODO adjust docker-compose to use postgraphile

- looking again into PostGraphile after facing Hasura issues:
    - https://github.com/hasura/graphql-engine/issues/284
    - https://github.com/hasura/graphql-engine/issues/506

2018-10-09

- delete executor's associated asset classes
- add executor's associated asset classes
- add asset-class-select-button
- executor associated with assetClass (not direct asset instance)

2018-10-08

- more adjustments as moving toward graphql

2018-10-04

- prepping settings to enable graphql queries/mutations
- some dockerized environment preps

2018-10-03

- experimenting with vue-apollo.

2018-08-09

- use custom event instead of property for 'created'

2018-08-09

- use encoded parameters (encodeURIComponent)

2018-08-08

- register argument
- use task table in plan
- register task; other misc adjs

2018-08-07

- require asset classes for taskdef registration
- register executor, asset, taskdef, parameter, plan

2018-08-06

- initial skeleton
