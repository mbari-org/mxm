create table if not exists executor
(
	"executorId" varchar not null
		constraint executor_pkey
			primary key,
	"httpEndpoint" text not null,
	description text
)
;

create table if not exists taskdef
(
	"taskdefId" varchar not null
		constraint taskdef_pkey
			primary key,
	description text
)
;

create table if not exists "assetClass"
(
	"className" varchar not null
		constraint assetclass_pkey
			primary key,
	description text
)
;

create table if not exists asset
(
	"assetId" varchar not null
		constraint asset_pkey
			primary key,
	"assetClass" varchar not null
		constraint assetclass_fk
			references "assetClass",
	description text
)
;

create table if not exists executor_asset
(
	"executorId" varchar not null
		constraint executor_fk
			references executor,
	"assetId" varchar not null
		constraint asset_fk
			references asset
)
;

create index if not exists executor_asset_executorid_index
	on executor_asset ("executorId")
;

create table if not exists taskdef_assetclass
(
	"taskdefId" varchar
		constraint taskdef_assetclass_td_fk
			references taskdef,
	"assetClass" varchar
		constraint taskdef_assetclass_fk
			references "assetClass"
)
;

create table if not exists parameter
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
			references taskdef,
	"paramName" varchar
		constraint taskdef_param_parameter_name_fk
			references parameter
)
;

create table if not exists task
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

create table if not exists plan
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
			references plan,
	"taskId" varchar
		constraint plan_task__taskid_fk
			references task
)
;

create table if not exists argument
(
	"paramName" varchar
		constraint argument__paramname_fk
			references parameter,
	"paramValue" text
)
;
