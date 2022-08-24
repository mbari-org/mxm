package org.mbari.mxm.db.mission;

import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.config.RegisterRowMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.List;

@RegisterRowMapper(MissionMapper.class)
@RegisterBeanMapper(Mission.class)
public interface MissionDao {

  @SqlQuery("select * from missions")
  List<Mission> getAllMissions();

  @SqlQuery(
    """
      select * from missions
      where provider_id    = :providerId
      """
  )
  List<Mission> getMissionsForProvider(@Bind("providerId") String providerId);

  @SqlQuery(
    """
      select * from missions
      where provider_id    = :providerId
        and mission_tpl_id = :missionTplId
      """
  )
  List<Mission> getMissions(@Bind("providerId") String providerId,
                            @Bind("missionTplId") String missionTplId);

  @SqlQuery(
    """
      select * from missions
      where provider_id    = :providerId
        and mission_tpl_id = :missionTplId
        and mission_id     = :missionId
      """
  )
  Mission getMission(@Bind("providerId") String providerId,
                     @Bind("missionTplId") String missionTplId,
                     @Bind("missionId") String missionId
  );

  @SqlUpdate(
    """
      insert into missions
      (provider_id, mission_tpl_id, mission_id,
       mission_status, asset_id, description, sched_type,
        sched_date, start_date, end_date)
      values
      (:providerId, :missionTplId, :missionId,
       :missionStatus, :assetId, :description, :schedType,
        :schedDate, :startDate, :endDate)
      returning *
      """
  )
  @GetGeneratedKeys
  Mission insertMission(@BindBean Mission pl);

  @SqlUpdate(
    """
      delete from missions
      where provider_id    = :providerId
        and mission_tpl_id = :missionTplId
        and mission_id     = :missionId
      returning *
      """
  )
  @GetGeneratedKeys
  Mission deleteMission(@Bind("providerId") String providerId,
                        @Bind("missionTplId") String missionTplId,
                        @Bind("missionId") String missionId);

}
