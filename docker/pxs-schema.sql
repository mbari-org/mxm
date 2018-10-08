create table if not exists executors
(
	"executorId" varchar not null
		constraint executor_pkey
			primary key,
	"httpEndpoint" text not null,
	description text
)
;

create table if not exists taskdefs
(
	"taskdefId" varchar not null
		constraint taskdef_pkey
			primary key,
	description text
)
;

create table if not exists "assetClasses"
(
	"className" varchar not null
		constraint assetclass_pkey
			primary key,
	description text
)
;

create table if not exists assets
(
	"assetId" varchar not null
		constraint asset_pkey
			primary key,
	"assetClass" varchar not null
		constraint assetclass_fk
			references "assetClasses",
	description text
)
;

create table if not exists executor_asset
(
	"executorId" varchar not null
		constraint executor_fk
			references executors,
	"assetId" varchar not null
		constraint asset_fk
			references assets
)
;

create index executor_asset_executorId_index
	on executor_asset ("executorId")
;

create table if not exists taskdef_assetclass
(
	"taskdefId" varchar
		constraint taskdef_assetclass_td_fk
			references taskdefs,
	"assetClass" varchar
		constraint taskdef_assetclass_fk
			references "assetClasses"
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
		constraint taskdef_taskdefid_fk
			references taskdefs,
	"paramName" varchar
		constraint taskdef_param_parameter_name_fk
			references parameters
)
;

create table if not exists tasks
(
	"executorId" varchar,
	"taskdefId" varchar,
	"assetId" varchar,
	name text,
	description text,
	"startDate" timestamp with time zone,
	"endDate" timestamp with time zone,
	geometry json,
	"taskId" varchar not null
		constraint task_pk
			primary key
)
;

create table if not exists plans
(
	name text not null,
	description text,
	"planId" varchar not null
		constraint plan_pk
			primary key
)
;

create table if not exists plan_task
(
	"planId" varchar
		constraint plan_task__planid_fk
			references plans,
	"taskId" varchar
		constraint plan_task__taskid_fk
			references tasks
)
;

create table if not exists arguments
(
	"paramName" varchar
		constraint argument__paramname_fk
			references parameters,
	"paramValue" text
)
;
