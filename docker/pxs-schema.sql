create table if not exists executor
(
	executorid varchar not null
		constraint executor_pkey
			primary key,
	httpendpoint text not null,
	description text
)
;

create table if not exists taskdef
(
	taskdefid varchar not null
		constraint taskdef_pkey
			primary key,
	description text
)
;

create table if not exists assetclass
(
	classname varchar not null
		constraint assetclass_pkey
			primary key,
	description text
)
;

create table if not exists asset
(
	assetid varchar not null
		constraint asset_pkey
			primary key,
	assetclass varchar not null
		constraint assetclass_fk
			references assetclass,
	description text
)
;

create table if not exists executor_asset
(
	executorid varchar not null
		constraint executor_fk
			references executor,
	assetid varchar not null
		constraint asset_fk
			references asset
)
;

create table if not exists taskdef_assetclass
(
	taskdefid varchar
		constraint taskdef_assetclass_td_fk
			references taskdef,
	assetclass varchar
		constraint taskdef_assetclass_fk
			references assetclass
)
;

create table if not exists parameter
(
	name varchar not null
		constraint parameter_pkey
			primary key,
	type varchar not null,
	required boolean default false not null,
	defaultvalue varchar,
	description text
)
;

create table if not exists taskdef_param
(
	taskdefid varchar
		constraint taskdef_taskdefid_fk
			references taskdef,
	paramname varchar
		constraint taskdef_param_parameter_name_fk
			references parameter
)
;

create table if not exists task
(
	executorid varchar,
	taskdefid varchar,
	assetid varchar,
	name text,
	description text,
	start timestamp with time zone,
	"end" timestamp with time zone,
	geometry json,
	taskid varchar not null
		constraint task_pk
			primary key
)
;

create table if not exists plan
(
	name text not null,
	description text,
	planid varchar not null
		constraint plan_pk
			primary key
)
;

create table if not exists plan_task
(
	planid varchar
		constraint plan_task__planid_fk
			references plan,
	taskid varchar
		constraint plan_task__taskid_fk
			references task
)
;

create table if not exists argument
(
	paramname varchar
		constraint argument__paramname_fk
			references parameter,
	paramvalue text
)
;
