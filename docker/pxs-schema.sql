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

create table if not exists mission_defs
(
  executor_id varchar not null,
  mission_def_id varchar not null,
  description varchar,
  foreign key (executor_id) references executors on update cascade on delete cascade,
  primary key (executor_id, mission_def_id)
)
;

create table if not exists mission_def_asset_class
(
  executor_id varchar not null,
  mission_def_id varchar not null,
  asset_class_name varchar not null,
  foreign key (executor_id, mission_def_id) references mission_defs on update cascade on delete cascade,
  foreign key (executor_id, asset_class_name) references asset_classes on update cascade on delete cascade,
  primary key (executor_id, mission_def_id, asset_class_name)
)
;

create table if not exists parameters
(
  executor_id varchar not null,
  mission_def_id varchar not null,
  param_name varchar not null,
  type varchar not null,
  required boolean default false not null,
  default_value varchar,
  description varchar,
  foreign key (executor_id, mission_def_id) references mission_defs on update cascade on delete cascade,
  primary key (executor_id, mission_def_id, param_name)
)
;

create table if not exists missions
(
  executor_id varchar not null,
  mission_def_id varchar not null,
  mission_id varchar not null,
  asset_id varchar not null,
  description varchar,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  geometry json,
  foreign key (executor_id, mission_def_id) references mission_defs on update cascade on delete cascade,
  foreign key (executor_id, asset_id) references assets on update cascade on delete cascade,
  primary key (mission_id)
)
;

create table if not exists arguments
(
  mission_id varchar not null,
  executor_id varchar not null,
  mission_def_id varchar not null,
  param_name varchar not null,
  param_value varchar not null,
  primary key (mission_id, param_name),
  foreign key (mission_id) references missions (mission_id) on update cascade on delete cascade,
  foreign key (executor_id, mission_def_id, param_name) references parameters on update cascade on delete cascade
)
;
