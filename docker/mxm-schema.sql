create type executor_api_type as enum (
  'rest0',
  'graphql'
)
;

create table if not exists executors
(
  executor_id varchar not null,
  http_endpoint varchar not null,
  api_type executor_api_type not null,
  description varchar,
  can_validate boolean default false not null,
  uses_units boolean default false not null,
  primary key (executor_id)
)
;

create table if not exists asset_classes
(
  executor_id varchar not null,
  class_name varchar not null,
  description varchar,
  foreign key (executor_id) references executors on update cascade on delete cascade,
  primary key (executor_id, class_name)
)
;

create table if not exists assets
(
  executor_id varchar not null,
  asset_id varchar not null,
  class_name varchar not null,
  description varchar,
  foreign key (executor_id, class_name) references asset_classes on update cascade on delete cascade,
  primary key (executor_id, asset_id)
)
;

create table if not exists mission_tpls
(
  executor_id varchar not null,
  mission_tpl_id varchar not null,
  description varchar,
  foreign key (executor_id) references executors on update cascade on delete cascade,
  primary key (executor_id, mission_tpl_id)
)
;

create table if not exists mission_tpl_asset_class
(
  executor_id varchar not null,
  mission_tpl_id varchar not null,
  asset_class_name varchar not null,
  foreign key (executor_id, mission_tpl_id) references mission_tpls on update cascade on delete cascade,
  foreign key (executor_id, asset_class_name) references asset_classes on update cascade on delete cascade,
  primary key (executor_id, mission_tpl_id, asset_class_name)
)
;

create table if not exists units
(
  executor_id varchar not null,
  unit_name varchar not null,
  abbreviation varchar,
  base_unit varchar,
  foreign key (executor_id) references executors on update cascade on delete cascade,
  foreign key (executor_id, base_unit) references units on update cascade on delete cascade,
  primary key (executor_id, unit_name)
)
;

create table if not exists parameters
(
  executor_id varchar not null,
  mission_tpl_id varchar not null,
  param_name varchar not null,
  type varchar not null,
  required boolean default false not null,
  default_value varchar,
  default_units varchar,
  description varchar,
  foreign key (executor_id, mission_tpl_id) references mission_tpls on update cascade on delete cascade,
  foreign key (executor_id, default_units) references units on update cascade on delete cascade,
  primary key (executor_id, mission_tpl_id, param_name)
)
;

create type mission_status_type as enum (
  'draft',
  'submitted',
  'queued',
  'running',
  'terminated'
)
;

create table if not exists missions
(
  executor_id varchar not null,
  mission_tpl_id varchar not null,
  mission_id varchar not null,
  mission_status mission_status_type not null,
  asset_id varchar not null,
  description varchar,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  foreign key (executor_id, mission_tpl_id) references mission_tpls on update cascade on delete cascade,
  foreign key (executor_id, asset_id) references assets on update cascade on delete cascade,
  primary key (executor_id, mission_tpl_id, mission_id)
)
;

create table if not exists arguments
(
  executor_id varchar not null,
  mission_tpl_id varchar not null,
  mission_id varchar not null,
  param_name varchar not null,
  param_value varchar not null,
  param_units varchar,
  foreign key (executor_id, mission_tpl_id, mission_id) references missions on update cascade on delete cascade,
  foreign key (executor_id, mission_tpl_id, param_name) references parameters on update cascade on delete cascade,
  primary key (executor_id, mission_tpl_id, mission_id, param_name)
)
;
