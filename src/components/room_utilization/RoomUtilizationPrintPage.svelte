<script>
  import { onMount } from "svelte";
  import ScheduleService from "../../services/ScheduleService";
  import SubjectService from "../../services/SubjectService";
  import SemesterService from "../../services/SemesterService";
  import SemesterTeacherService from "../../services/SemesterTeacherService";
  import FacultyService from "../../services/FacultyService";
  import SignatoryService from "../../services/SignatoryService";
  import schedule_times from "../../lib/schedule_times";
  import Signatories from "../teacher_schedule/Signatories.svelte";
  import { uniq, uniqBy } from "lodash-es";
  export let params = {};

  const assets_url = CONFIG.ASSETS_URL;
  let { room, id: semester_id } = params;
  let scheduleService = new ScheduleService();
  let subjectService = new SubjectService();
  let semesterService = new SemesterService();
  let facultyService = new FacultyService();
  let teacherService = new SemesterTeacherService();
  let signatoryService = new SignatoryService();

  let asyncSchedules;
  let roomSchedules = [];

  const getInitials = (name) => {
    let names = name.split(' ');
    let initials = [];

    for(let i=0; i<names.length; i++) {
      initials.push(names[i].charAt(0) + '.');
    }

    return initials.join('');
  }

  const getSchedules = async (room, semester_id) => {
    let formData = new FormData();
    formData.set("room", room);
    formData.set("semester_id", semester_id);
    let schedules = await scheduleService.getByForm(formData);
    let schedulesWithSubject = [];

    for (let i = 0; i < schedules.length; i++) {
      let schedule = schedules[i];
      let subject = await subjectService.get(schedule.subject_id);
      let semester_teacher = await teacherService.get(schedule.teacher_id);
      let teacher = await facultyService.get(semester_teacher.personnel_id);

      schedule.subject = subject;
      schedule.teacher = teacher;
      schedulesWithSubject.push(schedule);
    }

    return schedulesWithSubject;
  };

  let printed = false;
  $: if (roomSchedules?.length)
    (() => {
      if (!printed) {
        setTimeout(() => {
          // window.print();
          // window.close();
        }, 2000);
        printed = true;
      }
    })();

  let semester;
  let signatory;
  let summarizedSchedules = [];
  onMount(async () => {
    if (room && semester_id) {
      asyncSchedules = getSchedules(room, semester_id);
      roomSchedules = await asyncSchedules;
      semester = await semesterService.get(semester_id);
      let formData = new FormData();
      formData.set('college', 'NONE');
      formData.set('document', 'ROOM UTILIZATION');
      let signatories = await signatoryService.getByForm(formData);
      signatory = signatories[0] ?? {};

      summarizedSchedules = uniqBy(roomSchedules, schedule => `${schedule.subject_id}-${schedule.section}`);
      summarizedSchedules = summarizedSchedules.map(schedule => {
        let duplicates = roomSchedules.filter(sched => (sched.subject_id==schedule.subject_id && sched.section==schedule.section));
        let days  = duplicates.map(dup => dup.day_of_week.toUpperCase());
        let times = duplicates.map(dup => `${dup.start_time}-${dup.end_time}`);
        let sched_day, sched_time;

        if(days.length > 1) {
          sched_day = uniq(days.map(day => {
            return (day=='THURSDAY') ? 'TH' : day.charAt(0);
          })).join('');
        } else {
          sched_day = days[0].substring(0,3)
        }

        sched_time = uniq(times).join(' / ');

        return {
          ...schedule,
          sched_day,
          sched_time,
        }
      });
    }
  });

  let columns = "ABCDEFG";
  let rows = [];
  let headers = [
    "TIME",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  for (let i = 1; i <= 28; i++) {
    rows.push(i);
  }
</script>

<div class="printable-area">
  <div id="header">
    <img src={`${assets_url}/img/header-vpaa.png`} alt="Header" />
  </div>

  <div id="content">
    <table class="w-full">
      <thead>
        <tr>
          <td>
            <div class="header-placeholder h-fit"></div>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <!-- Contents to print goes here. -->
            <div
              style="padding: 0 1in; width: 100%; font-family:'Times New Roman', Times, serif;"
            >
              <div class="w-full">
                <section class="text-center font-bold mb-3">
                  <h2 class="mb-1">OFF-CAMPUS PROGRAM - GENERAL TINIO (PAPAYA)</h2>
                  <h2 style="line-height:90%;">ROOM UTILIZATION
                    {#if semester}
                      <br class="m-0"><i>{semester.semester} Semester, Academic Year {semester.academic_year}</i>
                    {/if}
                  </h2>
                </section>
                {#if room}
                  <table class="w-full text-xs">
                    <tr>
                      <td class="px-1 w-1/3 leading-none">ROOM NUMBER: </td>
                      <td class="w-2/3 leading-none font-bold">{room}</td>
                    </tr>
                  </table>
                {/if}
                <div class="schedules-container w-full text-xs">
                  <div class="w-full overflow-visible relative">
                    {#each columns as column}
                      {#each rows as row}
                        <div class="cell float-left"></div>
                      {/each}
                    {/each}
                    <div
                      class="header-row w-full absolute top-0 left-0 right-0"
                    >
                      {#each headers as header}
                        <div
                          class="cell capitalize float-left text-center leading-none font-bold"
                        >
                          {header.toLowerCase()}
                        </div>
                      {/each}
                    </div>
                    <div
                      class="time-column h-fit cell-width absolute top-0 left-0"
                    >
                      {#each schedule_times as time}
                        <div
                          style="font-size: 10px;"
                          class="cell-height pt-1 box-border w-full text-center leading-none m-0 p-0"
                        >
                          {time}
                        </div>
                      {/each}
                    </div>

                    {#await asyncSchedules}
                      <h1 class="text-center w-full absolute top-32">
                        Loading schedules...
                      </h1>
                    {:then}
                      {#if roomSchedules}
                        {#each roomSchedules as item}
                          {@const day_of_week = item.day_of_week.toLowerCase()}
                          {@const start_time = item.start_time
                            .toLowerCase()
                            .replace(" ", "")
                            .replace(":", "-")}
                          {@const end_time = item.end_time
                            .toLowerCase()
                            .replace(" ", "")
                            .replace(":", "-")}
                          <div
                            style="margin-top: 20px;"
                            class="text-xs absolute cell flex flex-col items-center justify-center {day_of_week} start-{start_time}_end-{end_time} bg-{item.color}-500"
                          >
                            <p>{item.subject.code}</p>
                            <p>{getInitials(item.teacher.first_name)} {item.teacher.last_name}</p>
                            <p>({item.section})</p>
                          </div>
                        {:else}
                          <h1 class="text-center">No schedules found.</h1>
                        {/each}
                      {/if}
                    {/await}
                  </div>
                  <div class="w-full flex flex-col text-xs">
                    <section class="text-center bg-yellow-300 font-bold" style="border: 1px solid #000;">
                      SUMMARY
                    </section>
                    <table class="w-full" style="border: 1px solid #000; border-top: none; line-height: 90%;">
                        <tr>
                          <td class="px-2 font-bold text-center" style="border: 1px solid #000;" colspan="2">DAY & TIME</td>
                          <td class="px-2 font-bold text-center" style="border: 1px solid #000;">COURSE/YR/SEC</td>
                          <td class="px-2 font-bold text-center" style="border: 1px solid #000;">FACULTY</td>
                          <td class="px-2 font-bold text-center" style="border: 1px solid #000;">COURSE CODE</td>
                          <td class="px-2 font-bold text-center" style="border: 1px solid #000;" colspan="2">COURSE DESCRIPTION</td>
                        </tr>
                        <tr>
                          <td class="cell-width"></td>
                          <td class="cell-width"></td>
                          <td class="cell-width"></td>
                          <td class="cell-width"></td>
                          <td class="cell-width"></td>
                          <td class="cell-width"></td>
                          <td class="cell-width"></td>
                        </tr>
                        {#each summarizedSchedules as schedule}
                          <tr>
                            <td class="align-top px-2 text-center capitalize" colspan="2">
                              {schedule.sched_day}
                              {schedule.sched_time}
                            </td>
                            <td class="align-top px-2 text-center">{schedule.section}</td>
                            <td class="align-top px-2 text-center">{getInitials(schedule.teacher.first_name)} {schedule.teacher.last_name}</td>
                            <td class="align-top px-2 text-center">{schedule.subject.code}</td>
                            <td class="align-top px-2 text-center capitalize" colspan="2">{schedule.subject.title.toLowerCase()}</td>
                          </tr>
                        {/each}
                    </table>
                  </div>
                  <br>
                  {#if signatory}
                    {@html signatory.content}
                  {/if}
                  <!-- <Signatories /> -->
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td>
            <div class="footer-placeholder h-fit"></div>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
  <span id="document_version">
    NEUST-AAF-F012<br>
    Rev. 01 (01.10.2019)
  </span>
  <div id="footer">
    <img src={`${assets_url}/img/footer-vpaa.png`} alt="Footer" />
  </div>
</div>

<style>
  @import "../teacher_schedule/scheduler.v1.9.css";
  .schedules-container {
    --block-height: 20px;
    --margin-bottom: 0.85in;
  }

  html,
  body,
  .printable-area {
    height: 100% !important;
    margin: 0;
  }

  #document_version {
    display: none;
  }

  @media print {
    #document_version {
      font-family: 'Times New Roman', Times, serif;
      font-size: 10px;
      position:fixed;
      left: 0.5in;
      bottom: 0.75in;
      display: block;
    }


    #header {
      top: 0;
    }

    #footer {
      bottom: 0;
      height: var(--margin-bottom); 
      overflow:visible;
    }

    #header,
    #footer {
      left: 0;
      right: 0;
      position: fixed;
      z-index: 9999;
    }

    #header img,
    #footer img {
      width: 100%;
    }

    .header-placeholder {
      height: 1.45in;
    }

    .footer-placeholder {
      height: 0.85in;
    }

    @page {
      size: 8.5in 13in;
      margin: 0;
    }
  }
</style>
