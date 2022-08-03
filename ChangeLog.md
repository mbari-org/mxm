2022-08

- adjustments; library updates; also added justfile, initially to better
  organize dispatch of server and webapp components for local development

2022-06

- some overall testing, all satisfactory:
    - against the TSAUV MXM provider (on tsauv), but only in terms of queries for definitions
      as well as creation of a mission (but not submission)
      (BTW, bitbucket/mbari/tft code also updated)
    - against TethysDash@okeanids, including submission of a sci2.tl mission against sim
      (only involving database related updates -- not actual simulator involved)

- bump versions (to 0.8.6) after the various PR merges from dependabot
- webapp: to facilitate adjustments, decided to copy the qgeomap extension code here directly
  (as of commit 37b847d4fa4915e0956be437d5dc4989051f62cb).
  (in part also because dealing with the npm registry is a bit of an unnecessary hassle, at least at this point.)
- some revision here along with the provider API implementation in TethysDash
  given its recent addition of TethysL mission handling.

2021-11

- enable that initial db query (providers) at start of service
 (which helps as quick verification)
- webapp: `quasar upgrade -i` then -> " All Quasar packages are up to date."
- dependency cleanup
- providers dropdown as dev convenience to select from known providers
- notes running all locally
- add docker release workflow
  So, removed the broken build at Docker Hub as it's proved problematic to update the configuration.
  There's currently also some limitation regarding linked accountgls for the organization.

2021-08

- migrate to github actions for ci

2021-06  0.8.3

- doc edits; update dockerHub build to use `main` branch for latest image
  Argh, DockerHub is buggy: it's failing to save the new build rule (with branch:main)
  but also any save, like just removing the current branch:master ;(
  https://github.com/docker/hub-feedback/issues/2007
  Bump and tag version (v0.8.3) mainly just to trigger the usual tag rule.
- use tethystest:8080 for default new provider

2020-10

- add store/store-flag.d.ts as it seems it should be under version control(?)
- slack notif to channel `#mxm-dev`

2020-07

- q-layout now in qgeomap

- menu in parameter-value was getting unexpectedly closed upon just accepting
  the edits in the qgeomap editor BUT ths hould be when the user actually
  click the "Set" button in the menu.
  This seems fixed by adding `persistent` to the menu.

- add some development notes

- minor style adjs while reviewing

- update mxmVal test snapshots and adjust ci to use them
  instead of always generating them!

0.8.3

- adjustments to have direct server program `server/src/server.js` running again.

    I can now run it again either against my local Postgres server:

        PG_CONN_STRING=postgres://postgres@localhost:5432/mxm

    or against the dockerized postgres server (also used for a regular deployment):

        PG_CONN_STRING=postgres://mxm@localhost:25432/mxm

    In one terminal:

        (cd server && bin/esm.js)

    In another terminal:

        vi webapp/src/statics/config/config.json
        # to indicate: "graphqlUri": "http://localhost:3000/mxm-graphql"

        (cd webapp && quasar dev --modern)

0.8.2

- add `npm prune --production` for the server.
  Image size is now 214MB
- removal of unneeded stuff in docker image for the webapp.
  Image size is now 274MB instead of 898MB

2020-06

0.8.1

- move server sources to server/src
- webapp: `yarn upgrade` and fix deprecation exposed by `jest`

- 0.8.0 with general code reorganization
    - move ui to webapp/
    - move server to server/
    - update docker image generation
    - All seems to be functional as before
      but some cleanup may be pending, in particular re unneeded dependencies
      in either compomponet

    - Note: As before this reorganization, local launch of postgraphile either directly
      (`npx postgraphile -c "$PG_CONN_STRING"`) or via `bin/esm.sh`
      is failing to connect to the database, both a local one or a dockerized one.
      Not sure when this started to happen.
      Interestingly (and furtunately), the dockerized version works just fine
      TODO revisit this.

- remove those initial typescript settings as they were triggering issues, which got
  worse as they were preventing the docker image build from completing! ;(

- use qgeomap 0.0.2:

        quasar ext remove @mbari/qgeomap
        quasar ext add @mbari/qgeomap

- disable `watchOptions.ignored`: actually unneeded and, besides, causing the whole
  watch capability to stop working upomn the recent upgrades
- basic typescript enabling
- rebuild/publish postgres image. MXM @ http://mxm.shore.mbari.org/mxm/ working well again.
- upgrade quasar  (hmnm, but seems like it's not watching files as usual(?))
- move version info (taken from package.json) from boot/utl to App.vue

2020-04

- some upgrades triggered by reported minimist vulnerability
- recent merge of dependabot PR didn't actually include some other acorn related
  dependency that also triggered a "moderate vulnerability" while running
  "yarn audit" locally. I just addressed this by removing entry for
  `acorn@^6.0.1, acorn@^6.2.1` in yarn.lock and running `yarn` again.

- quasar upgrade (now 1.6.1) as a general way to also address
  recently reported vulnerability re "kind-of"

2020-02

- 0.6.2 minor adjustments while testing again against TFT provider
- exclude directories in mission template counting

- do keep order of parameters and order of other entity lists as reported from provider.
  runInSequence now accepts function as list element to generate corresponding promise;
  so no subsequent promise is even created until the ongoing one is completed.

- add filters to selection of template and asset when creating mission
- TODO template directory navigation (eg. when creating mission)

- improve handling of request for mission status involving provider
- add canReportMissionStatus to Provider model

- Provider page is now read-only (all editing removed)

- 0.6.1 AssetClass and Asset related pages are now read-only
- general more consistent handling of params change reaction

- complete version 0.6.0

- Parameter page is now read-only (all editing removed)

- TODO nicer route display to reflect mission template directory organization.
  Example:
    - Right now: `/#/TethysDash/mt/%2FInsert%2FNeedGPS`
    - Desirable: `/#/TethysDash/mt/Insert/NeedGPS`

- TODO show some sort of "Connected to provider" status icon.
  This can be initially be set to GREEN and then updated as attempted interactions happen,
  and also making use of the "ping" operation against provider (in a debounced fashion).
  In general, gracefully handle unsuccessful interaction with provider.

- complete core reload functionality for MissionTpls
- MissionTpls: auto-trigger reload when retrieved_at is null.
  Using vue-apollo `skip` option to coordinate distpach,
  https://vue-apollo.netlify.com/guide/apollo/queries.html#skipping-the-query .
  See also https://github.com/vuejs/vue-apollo/issues/441

- TODO note: all missionTplId's with leading slash at least for the moment
- adjustments and logging while trying to determine why listMissionTplsDirectoryResolverWrapper
  is being called twice, eg with directories `/` and `/Demo/`, upon a single the client query for `/Demo/`.

- removing editing/deletion of existing mission template (and all associated entities).
    - instead, the only "update" operation is to trigger a refresh from the provider.
    - remove edit/delete in MissionTpl (including adding params, class associations, etc)

- show retrieved_at in template and template listing pages
- db schema: mission template now with a `retrieved_at` column to indicate when
  the info was last retrieved from the provider.
  At insertion time, this will be `null` for a directory, and a datetime for
  a particular template.

- db schema: mission template relations only to actual templates, not directories

- adding handling for directory-based dispatch of mission templates
    - add page to dispatch either template directory listing or specific template
      depending on missionTplId.
      This includes new SQL function `list_mission_tpls_directory`

- new request `/info` for general provider info (including capabilities)

- new image mbari/mxm-postgres:0.5.0 based on postgres:12.1-alpine

- more re mission submission and reviewing check-status handling:
  TODO in general, a query for an already submitted mission should include
  chcking for status against provider so that a change here gets propagated
  to the database and ultimatly reported to the client with the update.

- handle mission submission in the server
- server preps for mission submission

- pass schedType and schedDate in postMission
  (now handled in TethysDash 3.4.2)

- simplify frontend code to reflect new backend behavior re provider registration

- introduce "provider manager" to handle creation of all relevant entities
  upon an insert of the basic provider information (providerId, httpEndpoint, apiType).

  TODO: revisit connectionTimeoutMillis for the PG Pool connection, which I
   made longer upon noting connection error while going through the createParameter
   request during a whole provider creation.

  TODO: cleanup some duplication of code related with axios/rest requests

- some preps for mxm plugin to continue using postgraphile as middleware

- mbari/mxm image now also as postgraphile-powered MXM server.
- getSchema with db connection re-attempts to facilitate docker-compose launch
- use node base image also for mxm container.
  (apache dependency removed)
- use node base image as builder for mxm

2020-01

Setting up express server on top of postgraphile to handle requests
involving interaction with external MXM providers.

Example:

- client makes a request to submit a mission
- server performs corresponding request to the provider
- provider confirms mission has been submitted
- server performs the update of the database
- server replies to client with confirmation


----

- some adjustments to graphql queries/mutations while experimenting with codegen
  (using https://github.com/apollographql/apollo-android in separate project)

- add watchtower toward enabling CD
- workflow:
    - development against *develop* branch
    - releases by merging into *master* and pushing tag

- set v0.5.0 to reflect recent adjustments
  and also to start exercising docker hub build with tag

- use multi-stage image build (mxm now 115MB instead of 684MB)
- build ajustments while prepararing automated docker release
  (including using the qgeomap extension from npm, not via local link)

- do executor to provider renaming

2019-12

TODO: "simple" geometry type as JSON, not string

- setup: `quasar ext add @quasar/testing` with Jest.
  This comes with a simple demo `test/jest/__tests__/App.spec.js`,
  add I added one basic one for an mxm component.

    Some commands:
    - `npm run test:unit`
    - `quasar test --unit jest` - same effect as the above
    - individual tests:
        - `npm run test:unit test/jest/__tests__/App.spec.js`
        - `npm run test:unit src/components/markdown/__tests__/mxm-markdown-view_jest.spec.js`
    - open majestic: `npm run test:unit:ui`

    For now, setting `collectCoverage: false`
    and git-ignoring `test/jest/coverage`

    Some refs:
        - https://quasar.dev/quasar-cli/testing-and-auditing
        - https://vue-test-utils.vuejs.org/guides/testing-single-file-components-with-jest.html
        - https://jestjs.io/docs/en/snapshot-testing

    Also, initial travis-ci

- build and deploy 0.3.5.
  Include adjustment in loading of `config.json` so it
  actually works also when app deployed under some URL "context"
  (not "root"), eg, `http://tsauv.shore.mbari.org/mxm/`

- improve mission-scheduling dispatch
- adding support for mission scheduling:
    - one of 3 types: ASAP, QUEUE, DATE
    - a date captured in the DATE case

- more unit handling, considering baseUnit for selection
- column for units and other adjs
- keep the order of parameters as reported from provider
- pass units when posting mission
- also use valueCanReference to check value (preliminary)
- capture executor info in mission query
- general update, incl adding descriptionFormat to capabilities
- add valueCanReference property to parameter
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
