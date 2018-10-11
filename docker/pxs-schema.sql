create table if not exists asset_classes
(
	class_name varchar not null,
	description varchar,
	primary key (class_name)
)
;

create table if not exists assets
(
	asset_id varchar not null,
	class_name varchar not null,
	description varchar,
	foreign key (class_name) references asset_classes,
	primary key (asset_id)
)
;

create table if not exists executors
(
	executor_id varchar not null,
	http_endpoint varchar not null,
	description varchar,
	primary key (executor_id)
)
;

create table if not exists task_defs
(
	executor_id varchar not null,
	task_def_id varchar not null,
	description varchar,
  foreign key (executor_id) references executors,
  primary key (executor_id, task_def_id)
)
;

create table if not exists taskdef_asset_class
(
	executor_id varchar not null,
	task_def_id varchar not null,
	asset_class_name varchar not null,
  foreign key (executor_id, task_def_id) references task_defs,
  foreign key (asset_class_name) references asset_classes,
  primary key (executor_id, task_def_id, asset_class_name)
)
;

create table if not exists parameters
(
	executor_id varchar not null,
	task_def_id varchar not null,
	name varchar not null,
	type varchar not null,
	required boolean default false not null,
	default_value varchar,
	description varchar,
  foreign key (executor_id, task_def_id) references task_defs,
  primary key (executor_id, task_def_id, name)
)
;

create table if not exists plans
(
	plan_id varchar not null,
	name varchar not null,
	description varchar,
  primary key (plan_id)
)
;

create table if not exists tasks
(
	plan_id varchar not null,
	task_id varchar not null,
	executor_id varchar not null,
	task_def_id varchar not null,
	asset_id varchar not null,
	name varchar,
	description varchar,
	start_date timestamp with time zone,
	end_date timestamp with time zone,
	geometry json,
  foreign key (plan_id) references plans,
  foreign key (executor_id, task_def_id) references task_defs,
  foreign key (asset_id) references assets,
  primary key (plan_id, task_id)
)
;

create table if not exists arguments
(
	plan_id varchar not null,
	task_id varchar not null,
	executor_id varchar not null,
	task_def_id varchar not null,
	param_name varchar not null,
	param_value varchar not null,
  primary key (plan_id, task_id, param_name),
  foreign key (plan_id, task_id) references tasks (plan_id, task_id),
  foreign key (executor_id, task_def_id, param_name) references parameters
)
;
