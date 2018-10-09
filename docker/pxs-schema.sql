create table if not exists executors
(
	"executorId" varchar not null
		constraint executors_pkey
			primary key,
	"httpEndpoint" text not null,
	description text
)
;

create table if not exists taskdefs
(
	"taskdefId" varchar not null
		constraint taskdefs_pkey
			primary key,
	description text
)
;

create table if not exists "assetClasses"
(
	"className" varchar not null
		constraint assetclasses_pkey
			primary key,
	description text
)
;

create table if not exists assets
(
	"assetId" varchar not null
		constraint assets_pkey
			primary key,
	"assetClass" varchar not null
		constraint assetclass_fk
			references "assetClasses",
	description text
)
;

create table if not exists executor_assetclass
(
	"executorId" varchar not null
		constraint executor_assetclass_executor_fk
			references executors,
	"assetClassName" varchar not null
		constraint executor_assetclass_assetclass_fk
			references "assetClasses",
    primary key("executorId", "assetClassName")
)
;

create table if not exists taskdef_assetclass
(
	"taskdefId" varchar
		constraint taskdef_assetclass_td_fk
			references taskdefs,
	"assetClassName" varchar
		constraint taskdef_assetclass_fk
			references "assetClasses",
  primary key("taskdefId", "assetClassName")
)
;

create table if not exists parameters
(
	name varchar not null
		constraint parameter_pkey
			primary key,
	type varchar not null,
	required boolean default false not null,
	"defaultValue" varchar,
	description text
)
;

create table if not exists taskdef_param
(
	"taskdefId" varchar
		constraint taskdef_param_taskdef_fk
			references taskdefs,
	"paramName" varchar
		constraint taskdef_param_paramname_fk
			references parameters,
   primary key("taskdefId", "paramName")
)
;

create table if not exists tasks
(
	"taskId" varchar not null
		constraint task_pk
			primary key,
	"executorId" varchar
    constraint tasks_executorid_fk
          references executors,
	"taskdefId" varchar
	  constraint tasks_taskdefid_fk
	        references taskdefs,
	"assetId" varchar
	  constraint tasks_assetid_fk
	        references assets,
	name text,
	description text,
	"startDate" timestamp with time zone,
	"endDate" timestamp with time zone,
	geometry json
)
;

create table if not exists plans
(
	"planId" varchar not null
		constraint plan_pk
			primary key,
	name text not null,
	description text
)
;

create table if not exists plan_task
(
	"planId" varchar
		constraint plan_task_planid_fk
			references plans,
	"taskId" varchar
		constraint plan_task_taskid_fk
			references tasks,
    primary key("planId", "taskId")
)
;

create table if not exists arguments
(
	"paramName" varchar
		constraint arguments_paramname_fk
			references parameters,
	"paramValue" text,
	"planId" varchar not null
		constraint arguments_planid_fk
			references plans,
	"taskId" varchar not null
		constraint arguments_taskid_fk
			references tasks,
  primary key("planId", "taskId", "paramName")
)
;
