<script>
  import { onMount } from "svelte";
  import SemesterService from "../../services/SemesterService";
  import SemesterTeacherService from "../../services/SemesterTeacherService";
  import FacultyService from "../../services/FacultyService";
  import ScheduleService from "../../services/ScheduleService";
  import SubjectService from "../../services/SubjectService";
  import SignatoryService from "../../services/SignatoryService";
  import Signatories from "../teacher_schedule/Signatories.svelte";
  import { sortBy, sumBy, uniq, uniqBy } from "lodash-es";
  import LoadingScreen from "../LoadingScreen.svelte";
  export let params = {};

  const assets_url = CONFIG.ASSETS_URL;
  let semester_id = params.id;
  let semesterService = new SemesterService();
  let semesterTeacherService = new SemesterTeacherService();
  let facultyService = new FacultyService();
  let scheduleService = new ScheduleService();
  let subjectService = new SubjectService();
  let signatoryService = new SignatoryService();
  let semester;

  const getSchedules = async (teacher_id, semester_id) => {
    let formData = new FormData();
    formData.set("teacher_id", teacher_id);
    formData.set("semester_id", semester_id);
    let schedules = await scheduleService.getByForm(formData);
    let schedulesWithSubject = [];

    for (let i = 0; i < schedules.length; i++) {
      let schedule = schedules[i];
      let subject = await subjectService.get(schedule.subject_id);

      schedule.subject = subject;
      schedulesWithSubject.push(schedule);
    }

    return schedulesWithSubject;
  };

  const getTeachers = async (semester_id) => {
    let _items = await semesterTeacherService.getWhere('semester_id', semester_id);
    let teachers = [];

    for(let i=0; i<_items.length; i++) {
      let item = _items[i];
      let teacher = await facultyService.get(item.personnel_id);
      teacher.assigned_id = item.id;

      teachers.push(teacher);
    }

    return teachers;
  }

  const getTeachersWithSchedules = async (semester_id) => {
    let teachers = await getTeachers(semester_id);
    let teachersWithSchedules = [];

    for(let i=0; i<teachers.length; i++) {
      let teacher = teachers[i];
      teacher.schedules = await getSchedules(teacher.assigned_id, semester_id);
      if(teacher.schedules.length > 0) {
        // teacher.schedules = uniqBy(teacher.schedules, (schedule) => schedule.subject_id);
        let teacherSchedules = teacher.schedules;
        let summarizedSchedules = uniqBy(teacherSchedules, schedule => `${schedule.subject_id}-${schedule.section}`);
        summarizedSchedules = summarizedSchedules.map(schedule => {
          let duplicates = teacherSchedules.filter(sched => (sched.subject_id==schedule.subject_id && sched.section==schedule.section));
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

        teacher.schedules = [...summarizedSchedules];
      }

      teachersWithSchedules.push(teacher);
    }

    return teachersWithSchedules;
  }

  let printed = false;
  $: if (items?.length)
    (() => {
      if (!printed) {
        setTimeout(() => {
            // window.print();
            // window.close();
        }, 2000);
        printed = true;
      }
    })();

  let items = [];
  let signatory;
  let processing = false;
  onMount(async () => {
    processing = true;
    semester = await semesterService.get(semester_id);
    items = await getTeachersWithSchedules(semester_id);
    items = sortBy(items, item => `${item.last_name} ${item.first_name}`);

    let formData = new FormData();
    formData.set('college', 'NONE');
    formData.set('document', 'TEACHING LOAD');
    let signatories = await signatoryService.getByForm(formData);
    signatory = signatories[0];

    console.log({items});

    processing = false;
  });
</script>

<div class="printable-area">
  <div id="header">
    <!-- <img src={`${assets_url}/img/header-landscape-neust-papaya.png`} alt="Header" /> -->
    <img src={`${assets_url}/img/landscape_header.png`} alt="Header" />
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
              <div class="w-full text-xs">
                <table class="w-full border-collapse border border-stone-900">
                  <thead>
                    <tr>
                    <th colspan={9} class="text-center text-red-600 border border-stone-900">
                      TEACHING LOAD<br>
                      {#if semester}
                        {semester.semester.toUpperCase()} SEM ({semester.academic_year})
                      {/if}
                    </th>
                    </tr>
                  </thead>
                  <tbody>
                    {#if items.length}
                      {#each items as item}
                        <tr>
                          <th class="border border-stone-900 text-center">FACULTY NAME</th>
                          <th class="border border-stone-900 text-center">SUB. CODE</th>
                          <th class="border border-stone-900 text-center">DESCRIPTIVE TITLE</th>
                          <th class="border border-stone-900 text-center">HRS.</th>
                          <th class="border border-stone-900 text-center">DAY</th>
                          <th class="border border-stone-900 text-center">TIME</th>
                          <th class="border border-stone-900 text-center">YEAR & SECTION</th>
                          <th class="border border-stone-900 text-center">ROOM</th>
                          <th class="border border-stone-900 text-center">TOTAL LOAD</th>
                        </tr>
                        {#if item.schedules.length > 1}
                          {@const totalLoad = sumBy(item.schedules, (schedule) => parseInt(schedule.subject.hours_week)) }
                          {#each item.schedules as schedule, i}
                            <tr>
                              {#if i==0}
                                <td rowspan={item.schedules.length} class="border border-stone-900 text-center text-red-600 underline">{item.name.toUpperCase()}</td>
                              {/if}
                              <td class="border border-stone-900 text-center">{schedule.subject.code}</td>
                              <td class="border border-stone-900 text-center">{schedule.subject.title}</td>
                              <td class="border border-stone-900 text-center">{schedule.subject.hours_week}</td>
                              <td class="border border-stone-900 text-center">{schedule.sched_day}</td>
                              <td class="border border-stone-900 text-center">{schedule.sched_time}</td>
                              <td class="border border-stone-900 text-center">{schedule.section}</td>
                              <td class="border border-stone-900 text-center">{schedule.room}</td>
                              {#if i==0}
                                <td rowspan={item.schedules.length} class="text-center">{totalLoad}</td>
                              {/if}                            
                            </tr>
                          {/each}
                        {:else if item.schedules.length == 0}
                          <tr>
                            <td class="border border-stone-900 text-center text-red-600 underline">{item.name.toUpperCase()}</td>
                            <td colspan={8} class="border border-stone-900 text-center uppercase">No schedules found.</td>
                          </tr>
                        {:else if item.schedules.length == 1}
                          {@const schedule = item.schedules[0]}
                          <tr>
                            <td class="border border-stone-900 text-center text-red-600 underline">{item.name.toUpperCase()}</td>
                            <td class="border border-stone-900 text-center">{schedule.subject.code}</td>
                            <td class="border border-stone-900 text-center">{schedule.subject.title}</td>
                            <td class="border border-stone-900 text-center">{schedule.subject.hours_week}</td>
                            <td class="border border-stone-900 text-center">{schedule.sched_day}</td>
                            <td class="border border-stone-900 text-center">{schedule.sched_time}</td>
                            <td class="border border-stone-900 text-center">{schedule.section}</td>
                            <td class="border border-stone-900 text-center">{schedule.room}</td>
                            <td class="border border-stone-900 text-center">{schedule.subject.hours_week}</td>
                          </tr>
                        {/if}
                      {/each}
                    {/if}
                  </tbody>
                </table>
              </div>
              {#if signatory}
                {@html signatory.content}
              {/if}
              <!-- <Signatories /> -->
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
  <div id="footer">
    <!-- <img src={`${assets_url}/img/footer-landscape-neust-papaya.png`} alt="Footer" /> -->
    <img src={`${assets_url}/img/landscape_footer.png`} alt="Footer" />
  </div>
</div>

{#if processing}
  <LoadingScreen />
{/if}

<svelte:head>
  <style>
    @media print {
      @page {
        size: landscape;
      }
    }
  </style>
</svelte:head>

<style>
  html,
  body,
  .printable-area {
    height: 100% !important;
    margin: 0;
  }

  .printable-area {
    --margin-top: 1.55in;
    --margin-bottom: 0.85in;
  }

  @media print {
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
      height: var(--margin-top);
    }

    .footer-placeholder {
      height: var(--margin-bottom);
    }

    @page {
      size: 8.5in 13in;
      margin: 0;
    }
  }
</style>
