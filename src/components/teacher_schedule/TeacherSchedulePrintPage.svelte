<script>
  import { onMount } from "svelte";
  import ScheduleService from "../../services/ScheduleService";
  import SubjectService from "../../services/SubjectService";
  import SemesterService from "../../services/SemesterService";
  import SemesterTeacherService from "../../services/SemesterTeacherService";
  import FacultyService from "../../services/FacultyService";
  import Signatories from "./Signatories.svelte";
  import TeacherDetails from "./TeacherDetails.svelte";
  import SignatoryService from "../../services/SignatoryService";
  import schedule_times from "../../lib/schedule_times";
  import { uniqBy } from "lodash-es";
  import LoadingScreen from "../LoadingScreen.svelte";
  export let params = {};

  const assets_url = CONFIG.ASSETS_URL;
  let { teacher_id, id: semester_id } = params;
  let scheduleService = new ScheduleService();
  let subjectService = new SubjectService();
  let semesterService = new SemesterService();
  let facultyService = new FacultyService();
  let teacherService = new SemesterTeacherService();
  let signatoryService = new SignatoryService();

  let asyncSchedules;
  let ownSchedules = [];

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

  let printed = false;
  $: if (ownSchedules?.length)
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
  let teacher;
  let faculty;
  let signatory;
  let totalHoursPerWeek = 0;
  let totalConsultation = 0;
  let processing = false;

  onMount(async () => {
    if (teacher_id && semester_id) {
      processing = true;

      asyncSchedules = getSchedules(teacher_id, semester_id);
      ownSchedules = await asyncSchedules;
      semester = await semesterService.get(semester_id);
      teacher = await teacherService.get(teacher_id);
      faculty = await facultyService.get(teacher.personnel_id);
      let formData = new FormData();
      formData.set('college', faculty.college);
      formData.set('document', 'FACULTY PROGRAM');
      let signatories = await signatoryService.getByForm(formData);
      signatory = signatories[0];

      let uniqueSchedules = uniqBy(ownSchedules, schedule => `${schedule.subject_id}-${schedule.section}`);
      totalHoursPerWeek = uniqueSchedules.reduce((prev, current) => {
        return (prev += Number.parseInt(current.subject.hours_week));
      }, 0);
      let consultationSchedules = ownSchedules.filter(item => item.subject.code=='CONSULTATION');
      totalConsultation = consultationSchedules.reduce((prev, current) => {
        return (prev += Number.parseInt(current.subject.hours_week));
      }, 0);

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
                  <h2 style="line-height: 90%;">FACULTY PROGRAM
                    {#if semester}
                      <br class="m-0"><i>{semester.semester} Semester, Academic Year {semester.academic_year}</i>
                    {/if}
                  </h2>
                </section>
                {#if faculty}
                  <TeacherDetails teacher={faculty} />
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
                      {#if ownSchedules}
                        {#each ownSchedules as item}
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
                            class="text-center text-xs absolute cell flex flex-col items-center justify-center {day_of_week} start-{start_time}_end-{end_time} bg-{item.color}-500"
                          >
                            {#if item.subject.program != '--'}
                              <p>{item.subject.code}</p>
                              <p>{item.section.split(' - ').join(' ')}</p>
                              <p>({item.room})</p>
                            {:else}
                              <p>{item.subject.title}</p>
                            {/if}
                          </div>
                        {:else}
                          <h1 class="text-center">No schedules found.</h1>
                        {/each}
                      {/if}
                    {/await}
                  </div>
                  <div class="w-full flex text-xs">
                    <div
                      style="border: 1px inset #000;"
                      class="block colspan-3 flex-1 px-2 py-1"
                    >
                      <h3 class="text-center leading-none font-bold">
                        Others Assignment/s
                      </h3>
                      <h3 class="leading-none font-bold">Designation: 
                        {#if teacher}
                          <span class="font-normal">{teacher.designation ?? ''}</span>
                        {/if}
                      </h3>
                      <h3 class="leading-none font-bold">
                        Overtime Services: <span class="font-normal"
                          >(Please Specify the Colleges, Subjects)</span
                        >
                      </h3>
                    </div>
                    <div
                      style="border: 1px inset #000;"
                      class="colspan-4 h-fit px-2 py-1"
                    >
                      <h3 class="text-center leading-none font-bold">
                        Summary<br />Number of Units/Hrs.
                      </h3>
                      <table class="w-full leading-none">
                        <tr><td class="w-1/2">Course Code</td><td>{totalHoursPerWeek - totalConsultation}</td></tr>
                        <tr><td class="w-1/2">Research</td><td></td></tr>
                        <tr><td class="w-1/2">Extension</td><td></td></tr>
                        <tr><td class="w-1/2">Consultation</td><td>{totalConsultation}</td></tr>
                        <tr><td class="w-1/2">PTM</td><td></td></tr>
                        <tr
                          ><td class="w-1/2">Total</td><td class="font-bold"
                            >{totalHoursPerWeek}</td
                          ></tr
                        >
                      </table>
                    </div>
                  </div>
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
    NEUST-AAF-F002<br>
    Rev. 02 (10.29.2024)
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
  @import "./scheduler.v1.9.css";
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
      bottom: 0.90in;
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
