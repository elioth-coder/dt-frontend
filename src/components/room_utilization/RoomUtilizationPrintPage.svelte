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
  import LoadingScreen from "../LoadingScreen.svelte";
  import { sortBy, uniq, uniqBy } from "lodash-es";
  import { addMinutes, differenceInMinutes, format } from "date-fns";
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

  let conflictingSchedules = [];
  const renderSchedules = async (schedules) => {
    let sortedSchedules = sortBy([...schedules], sched => {
      let days = {
        'MONDAY': 1,
        'TUESDAY': 2,
        'WEDNESDAY': 3,
        'THURSDAY': 4,
        'FRIDAY': 5,
        'SATURDAY': 6,
      }

      return days[sched.day_of_week] + sched.start_time;
    });

    console.log({sortedSchedules});
    
    sortedSchedules.forEach((sched, index) => {
      try {
        let end_time   = [format(new Date(), 'yyyy-MM-dd'), sched.end_time.replace('NN','PM')].join(' ');
        let start_time = [format(new Date(), 'yyyy-MM-dd'), sched.start_time.replace('NN','PM')].join(' ');
        let start_time_p_30 = format(addMinutes(start_time, 30), 'yyyy-MM-dd hh:mm a');
        let start_time_range = [
          start_time.split(' ').slice(1).join(''),
          start_time_p_30.split(' ').slice(1).join(''),
        ].join('-');
        let query = `[data-schedule="${sched.day_of_week}|${start_time_range}"]`;
        let td = document.querySelector(`${query}`);
        let tr = td.parentElement;
        let difference = differenceInMinutes(new Date(end_time), new Date(start_time)) / 30;

        td.setAttribute('rowspan', difference + '');
        td.innerHTML = `
          <p class="font-bold text-center">${sched.subject.code}</p>
          <p class="font-bold text-center my-2 keep-all capitalize">${sched.subject.title.toLowerCase()}</p>
          <p class="text-center">${sched.section}</p>
          <p class="text-center">${getInitials(sched.teacher.first_name)} ${sched.teacher.last_name}</p>
        `;

        let currentTr = tr;

        for(let i=1; i<difference; i++) {
          // @ts-ignore
          currentTr = currentTr.nextElementSibling;
          let node = currentTr.querySelector(`[data-day="${sched.day_of_week}"]`);
          node.remove();
        }

        console.log({
          schedule: `${sched.start_time.split(' ').join('')}-${sched.end_time.split(' ').join('')}`, 
          difference,
          sched,
        });
      } catch(e) {
        conflictingSchedules = [
          ...conflictingSchedules, 
          sortedSchedules[index-1],
          sched, 
        ];

        throw e;
      }
    });
  }

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
  let processing = false;
  let summarizedSchedules = [];
  onMount(async () => {
    if (room && semester_id) {
      processing = true;

      asyncSchedules = getSchedules(room, semester_id);
      roomSchedules = await asyncSchedules;
      semester = await semesterService.get(semester_id);
      let formData = new FormData();
      formData.set('college', 'NONE');
      formData.set('document', 'ROOM UTILIZATION');
      let signatories = await signatoryService.getByForm(formData);
      signatory = signatories[0] ?? {};

      renderSchedules(roomSchedules);

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

      processing = false;
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
    <!-- <img src={`${assets_url}/img/header-vpaa.png`} alt="Header" /> -->
    <img src={`${assets_url}/img/portrait_header.png`} alt="Header" />
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
                {#if conflictingSchedules.length}
                  <h1 class="text-lg my-0 text-red-700">POSSIBLE CONFLICTING SCHEDULES</h1>
                  <table class="mb-5 w-full border border-red-600 rounded bg-red-400 p-5">
                  {#each conflictingSchedules as conflict}
                    {#if conflict}
                      <tr>
                        <td>{conflict.day_of_week}</td>
                        <td>{conflict.start_time} - {conflict.end_time}</td>
                        <td class="align-top px-2">{conflict.section}</td>
                        <td class="align-top px-2">{getInitials(conflict.teacher.first_name)} {conflict.teacher.last_name}</td>
                        <td class="align-top px-2">{conflict.subject.code}</td>
                        <td class="align-top px-2 capitalize">{conflict.subject.title.toLowerCase()}</td>
                      </tr>
                    {/if}
                  {/each}
                  </table>
                {/if}

                {#if room}
                  <table class="w-full text-xs">
                    <tr>
                      <td class="px-1 w-1/3 leading-none">ROOM NUMBER: </td>
                      <td class="w-2/3 leading-none font-bold">{room}</td>
                    </tr>
                  </table>
                {/if}
                <div class="schedules-container w-full text-xs">
                  <div class="w-full flex flex-col text-xs">
                    <table class="table-fixed border border-black">
                      <tr>
                      {#each headers as header}
                        <th class="text-center capitalize border border-black" style="width:14.2857%;">{ header.toLowerCase() }</th>
                      {/each}
                      </tr>
                      {#each schedule_times as time, h}
                        {#if h>0}
                          <tr>
                            {#each headers as header, i}
                              {#if i==0}
                                <th class="overflow-hidden text-center border border-black" style="font-size: 10px; width:14.2857%;">{ time }</th>
                              {:else}
                                <td class="overflow-hidden border border-black" data-day="{header}" data-time="{time}" data-schedule="{header}|{time}" style="width:14.2857%;"></td>
                              {/if}
                            {/each}  
                          </tr>
                        {/if}
                      {/each}
                        <tr>
                          <th colspan="7" class="text-center font-bold border border-black" style="background-color: yellow;">SUMMARY</th>
                        </tr>
                        <tr>
                          <td class="px-2 font-bold text-center" style="border: 1px solid #000;" colspan="2">DAY & TIME</td>
                          <td class="px-2 font-bold text-center" style="border: 1px solid #000;">COURSE/<br>YR/SEC</td>
                          <td class="px-2 font-bold text-center" style="border: 1px solid #000;">FACULTY</td>
                          <td class="px-2 font-bold text-center" style="border: 1px solid #000;">COURSE<br>CODE</td>
                          <td class="px-2 font-bold text-center" style="border: 1px solid #000;" colspan="2">COURSE DESCRIPTION</td>
                        </tr>
                        {#each summarizedSchedules as schedule}
                          <tr>
                            <td class="align-top px-2 capitalize" colspan="2">
                              {schedule.sched_day}
                              {schedule.sched_time}
                            </td>
                            <td class="align-top px-2">{schedule.section}</td>
                            <td class="align-top px-2">{getInitials(schedule.teacher.first_name)} {schedule.teacher.last_name}</td>
                            <td class="align-top px-2">{schedule.subject.code}</td>
                            <td class="align-top px-2 capitalize" colspan="2">{schedule.subject.title.toLowerCase()}</td>
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
    <!-- <img src={`${assets_url}/img/footer-vpaa.png`} alt="Footer" /> -->
    <img src={`${assets_url}/img/portrait_footer.png`} alt="Footer" />
  </div>
</div>

{#if processing}
  <LoadingScreen />
{/if}

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
