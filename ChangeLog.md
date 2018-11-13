2018-11-13

- docker related adjustments while deploying on tsauv
    - PXS at      http://tsauv.shore.mbari.org/pxs/
    - graphiql at http://tsauv.shore.mbari.org/pxs-graphiql

2018-11-12

- organize routes so missionDefs and missions are shown under Executor
- fix mission-new-button to show list of assets of selected asset class
- parameter: allow to change name (if foreign key constraints allow)
- missionDef: Allow to change missionDefId, but note that this is possible
  only when there are no dependencies (foreign key constraints)
- link to parameter in argument table
- simplify executor page: just show id and description of missionDefs
- update executor's description and httpEndpoint
- update missionDef description

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
