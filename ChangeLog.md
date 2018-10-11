2018-10-11

- more on task and argument dispatch
- more on plan and task dispatch
- expose Asset Classes and Asset Class page

2018-10-10

- adjusting dispatch for plans and tasks
- initial dispatch of taskDefs
  TODO: assetClasses currently associated with executors *and* tasksDefs;
      decide on the following:
      - verify that association on taskDef is from list of those in executor
      - or, do this association on only one of those entities

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
