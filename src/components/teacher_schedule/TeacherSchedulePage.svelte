<script>
  import {
    Heading,
    Button,
    Spinner,
    Alert,
    Table,
    TableBodyRow,
    TableBodyCell,
    TableHead,
    TableHeadCell,
    Popover,
    Drawer,
    CloseButton,
    Avatar,
  } from "flowbite-svelte";
  import Page from "../Page.svelte";
  import ConfirmModal from "../ConfirmModal.svelte";
  import SemesterService from "../../services/SemesterService";
  import {
    ExclamationCircleSolid,
    InfoCircleSolid,
    PrinterOutline,
  } from "flowbite-svelte-icons";
  import { onMount } from "svelte";
  import Breadcrumb from "../Breadcrumb.svelte";
  import SemesterTeacherService from "../../services/SemesterTeacherService";
  import RecipientService from "../../services/RecipientService";
  import TeacherScheduleForm from "./TeacherScheduleForm.svelte";
  import ScheduleService from "../../services/ScheduleService";
  import SubjectService from "../../services/SubjectService";
  import { sineIn } from "svelte/easing";
  import { uniqBy } from "lodash-es";
  export let params = {};

  let { HOST_URL } = CONFIG;

  let semester_id = params.id;
  let teacher_id = params.teacher_id;
  let semesterService = new SemesterService();
  let teacherService = new SemesterTeacherService();
  let recipientService = new RecipientService();
  let scheduleService = new ScheduleService();
  let subjectService = new SubjectService();
  let hasUpdate = Date.now();
  let deleteItem = false;
  let editItem = false;
  let asyncDelete = null;
  let semester;
  let teacher;
  let recipient;
  let breadCrumbItems = [
    {
      href: "#/scheduler",
      label: "Scheduler",
    },
    {
      href: "#/scheduler/" + semester_id,
      label: "Faculty Program",
    },
    {
      href: `#/scheduler/${semester_id}/${teacher_id}`,
      label: "Teacher",
    },
  ];

  let schedule_times = [
    "08:00AM - 08:30AM",
    "08:30AM - 09:00AM",
    "09:00AM - 09:30AM",
    "09:30AM - 10:00AM",
    "10:00AM - 10:30AM",
    "10:30AM - 11:00AM",
    "11:00AM - 11:30AM",
    "11:30AM - 12:00NN",
    "12:00NN - 12:30PM",
    "12:30PM - 01:00PM",
    "01:00PM - 01:30PM",
    "01:30PM - 02:00PM",
    "02:00PM - 02:30PM",
    "02:30PM - 03:00PM",
    "03:00PM - 03:30PM",
    "03:30PM - 04:00PM",
    "04:00PM - 04:30PM",
    "04:30PM - 05:00PM",
    "05:00PM - 05:30PM",
    "05:30PM - 06:00PM",
    "06:00PM - 06:30PM",
    "06:30PM - 07:00PM",
    "07:00PM - 07:30PM",
    "07:30PM - 08:00PM",
    "08:00PM - 08:30PM",
    "08:30PM - 09:00PM",
    "09:00PM - 09:30PM",
  ];

  const generateSections = async () => {
    let programs = await subjectService.getPrograms();
    programs = programs.map((item) => item.program);

    let letters = ["A", "B", "C"];
    let blocks = [];

    for (let i = 0; i < programs.length; i++) {
      for (let j = 1; j <= 4; j++) {
        for (let k = 0; k < letters.length; k++) {
          blocks.push(`${programs[i]} - ${j}${letters[k]}`);
        }
      }
    }
    let options = blocks.map((block) => ({ name: block, value: block }));

    return options;
  };

  const confirmDelete = (item) => {
    deleteItem = item;
  };

  const handleDelete = async () => {
    // @ts-ignore
    let { id } = deleteItem;
    asyncDelete = scheduleService.delete(id);

    try {
      await asyncDelete;
      hasUpdate = Date.now();
    } catch (e) {}
  };

  const handleEdit = (item) => {
    editItem = false;
    hideDrawer = false;
    editItem = item;
  };

  let subjects = [];
  let sections = [];

  onMount(async () => {
    semester = await semesterService.get(semester_id);
    teacher = await teacherService.get(teacher_id);
    recipient = await recipientService.get(teacher.personnel_id);
    teacher.recipient = { ...recipient };
    subjects = await subjectService.getAll();
    sections = await generateSections();

    updateSchedules();
  });

  $: hasUpdate,
    (async () => {
      await updateSchedules();
      await updateOccupiedSchedules();
    })();

  const updateOccupiedSchedules = async () => {
    occupiedSchedules = uniqBy(
      [...ownSchedules, ...sectionSchedules, ...roomSchedules],
      (schedule) => schedule.id
    );   
    
  }

  const resetSchedulePreview = () => {
    newSchedule = null;
  };

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

  const updateSchedules = async () => {
    if (teacher_id && semester_id) {
      asyncSchedules = getSchedules(teacher_id, semester_id);
      ownSchedules = await asyncSchedules;
    }
  };

  let sectionSchedules = [];

  const handleSectionChange = async (e) => {
    let section = e.detail;
    let formData = new FormData();
    formData.set("semester_id", semester_id);
    formData.set("section", section);

    let schedules = await scheduleService.getByForm(formData);
    let schedulesWithSubject = [];

    for (let i = 0; i < schedules.length; i++) {
      let schedule = schedules[i];
      let subject = await subjectService.get(schedule.subject_id);

      schedule.subject = subject;
      schedulesWithSubject.push(schedule);
    }

    sectionSchedules = [...schedulesWithSubject];
  };

  let roomSchedules = [];

  const handleRoomChange = async (e) => {
    let room = e.detail;
    let formData = new FormData();
    formData.set("semester_id", semester_id);
    formData.set("room", room);

    let schedules = await scheduleService.getByForm(formData);
    let schedulesWithSubject = [];

    for (let i = 0; i < schedules.length; i++) {
      let schedule = schedules[i];
      let subject = await subjectService.get(schedule.subject_id);

      schedule.subject = subject;
      schedulesWithSubject.push(schedule);
    }

    roomSchedules = [...schedulesWithSubject];
  };

  let newSchedule;
  const handleSetSchedule = async (e) => {
    let schedule = e.detail;

    newSchedule = schedule;
  };

  let occupiedSchedules = [];
  $: {
    occupiedSchedules = uniqBy(
      [...ownSchedules, ...sectionSchedules, ...roomSchedules],
      (schedule) => schedule.id
    );
  }

  const handleCancel = () => {
    editItem = false;
    hideDrawer = true;
    resetSchedulePreview();
  };

  let hideDrawer = true;
  let transitionParams = {
    x: -320,
    duration: 200,
    easing: sineIn,
  };

  let columns = 'ABCDEFG';
  let rows = [];
  let headers = ['TIME', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  for(let i=1; i<=28; i++) {
    rows.push(i);
  }
</script>

<Page>
  <Breadcrumb items={breadCrumbItems} />
  <br />

  <Heading tag="h5" class="text-left align-middle my-0">
    {#if teacher}
      {@const photo = teacher.recipient?.photo
        ? teacher.recipient.photo
        : "profile.png"}
      <Avatar
        src={`${HOST_URL}/uploads/${photo}`}
        size="md"
        class="inline mx-3"
      />
      {teacher.recipient?.name}
    {:else}
      Loading...
    {/if}
    {#if hideDrawer}
      <Button on:click={() => (hideDrawer = false)} class="float-right">
        Add schedule
      </Button>
    {/if}
  </Heading>

  <div class="mb-4">
    {#if asyncDelete}
      {#await asyncDelete}
        <p>
          <Spinner />
          Deleting teacher...
        </p>
      {:then}
        <Alert color="green" class="m-0" dismissable>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          Successfully deleted the schedule
        </Alert>
      {:catch error}
        <Alert color="red" class="m-0" dismissable>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          {error.message}
        </Alert>
      {/await}
    {/if}
  </div>
  {#if semester}
    <div class="flex flex-col">
      <Drawer
        backdrop={false}
        activateClickOutside={false}
        transitionType="fly"
        {transitionParams}
        bind:hidden={hideDrawer}
      >
        <div class="flex items-center mb-4">
          <h4
            id="drawer-label"
            class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"
          >
            <InfoCircleSolid class="w-5 h-5 me-2.5" />Add new schedule
          </h4>
          <CloseButton
            on:click={() => (hideDrawer = true)}
            class="mb-4 dark:text-white"
          />
        </div>
        {#if subjects.length && sections.length}
          <TeacherScheduleForm
            {teacher_id}
            {semester_id}
            {subjects}
            {sections}
            item={editItem ?? null}
            on:update={() => (hasUpdate = Date.now())}
            on:cancel={handleCancel}
            on:set-schedule={handleSetSchedule}
            on:change-section={handleSectionChange}
            on:change-room={handleRoomChange}
          />
        {/if}
      </Drawer>
      <br />
      <div class="schedules-container w-full text-left">
        <div class="w-full overflow-visible relative">
          {#each columns as column}
            {#each rows as row}
              <div class="cell float-left"></div>
            {/each}
          {/each}
          <div class="header-row w-full absolute top-0 left-0 right-0">
            {#each headers as header}
              <div class="cell pt-1 capitalize float-left text-center leading-none">{header.toLowerCase()}</div>
            {/each}
          </div>
          <div class="time-column h-fit cell-width absolute top-0 left-0">
            <div class="cell-height w-full"></div>
            {#each schedule_times as time}
              <div class="text-xs cell-height pt-1 box-border w-full text-center leading-none m-0 p-0">{time}</div>
            {/each}
          </div>
          
          {#await asyncSchedules}
            <h1 class="text-center w-full absolute top-32">
              Loading schedules...
            </h1>
          {:then}
            {#if ownSchedules && hideDrawer==true}
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
                {@const trigger_id =
                  item.subject.code.replace(" ", "_").replace("-", "_") +
                  "_" +
                  item.id}                
                <div id={trigger_id}
                  style="margin-top: 25px;"
                  class="absolute cell flex flex-col items-center justify-center {day_of_week} start-{start_time}_end-{end_time} bg-{item.color}-500"
                >
                  <p>{item.subject.code}</p>
                  <p>{item.section.split(' - ').join(' ')}</p>
                  <p>({item.room})</p>
                </div>
                <Popover
                  trigger="click"
                  placement={"top"}
                  class="w-72 text-sm font-light z-50 text-black bg-gray-200"
                  title={`${item.subject.code} - ${item.subject.title}`}
                  triggeredBy="#{trigger_id}"
                >
                  <span>Day: {item.day_of_week}</span><br />
                  <span>Time: {item.start_time} - {item.end_time}</span><br />
                  <span>Section: {item.section}</span><br />
                  <span>Room: {item.room}</span>
                  <hr class="my-2" />
                  <section class="text-center">
                    <Button
                      on:click={() => handleEdit(item)}
                      size="xs"
                      color="dark"
                      outline>Edit</Button
                    >
                    <Button
                      on:click={() => confirmDelete(item)}
                      size="xs"
                      color="red"
                      outline>Delete</Button
                    >
                  </section>
                </Popover>
              {:else}
                <h1 class="text-center">No schedules found.</h1>
              {/each}
            {/if}
          {/await}
          {#if occupiedSchedules && hideDrawer==false}
            {#each occupiedSchedules as item}
              {@const day_of_week = item.day_of_week.toLowerCase()}
              {@const start_time = item.start_time
                .toLowerCase()
                .replace(" ", "")
                .replace(":", "-")}
              {@const end_time = item.end_time
                .toLowerCase()
                .replace(" ", "")
                .replace(":", "-")}
              {@const trigger_id =
                item.subject.code.replace(" ", "_").replace("-", "_") +
                "_" +
                item.id}
              <div
                id={trigger_id}
                style="margin-top: 25px;"
                class="absolute cell flex flex-col items-center justify-center {day_of_week} start-{start_time}_end-{end_time} opacity-75 bg-slate-400 !border-red-600 !border-8"
              >
                  <p>{item.subject.code}</p>
                  <p>{item.section.split(' - ').join(' ')}</p>
                  <p>({item.room})</p>
              </div>
              <Popover
                trigger="click"
                placement={"top"}
                class="w-64 text-sm font-light z-50"
                title={`${item.subject.code} - ${item.subject.title}`}
                triggeredBy="#{trigger_id}"
              >
                <span>Day: {item.day_of_week}</span><br />
                <span>Time: {item.start_time} - {item.end_time}</span><br />
                <span>Section: {item.section}</span><br />
                <span>Room: {item.room}</span>
              </Popover>
            {/each}
          {/if}
          {#if newSchedule}
            {@const color = newSchedule.color}
            {@const day_of_week = newSchedule.day_of_week.toLowerCase()}
            {@const start_time = newSchedule.start_time
              .toLowerCase()
              .replace(" ", "")
              .replace(":", "-")}
            {@const end_time = newSchedule.end_time
              .toLowerCase()
              .replace(" ", "")
              .replace(":", "-")}
            <div
              style="margin-top: 25px;"
              class="absolute cell flex flex-col items-center justify-center {day_of_week} start-{start_time}_end-{end_time} bg-{color}-400 !border-green-600 !border-8"
            >
              <Heading tag="h6" class="text-center">NEW</Heading>
            </div>
          {/if}
        </div>
      </div>
      <br />
      <div class="flex flex-col max-w-4xl">
        <Table striped={true} border={true}>
          <TableHead>
            <TableHeadCell>ROOM NO.</TableHeadCell>
            <TableHeadCell>SECTION</TableHeadCell>
            <TableHeadCell>SUBJECT</TableHeadCell>
            <TableHeadCell>TIME</TableHeadCell>
            <TableHeadCell>DAY</TableHeadCell>
            <TableHeadCell class="text-center">ACTION</TableHeadCell>
          </TableHead>
          {#await asyncSchedules}
            <TableBodyRow>
              <TableBodyCell colspan={6} class="text-center">
                <Spinner size={4} class="me-1" />
                Fetching schedules...
              </TableBodyCell>
            </TableBodyRow>
          {:catch error}
            <TableBodyRow>
              <TableBodyCell colspan={6} class="text-center text-red-600">
                {error.message}
              </TableBodyCell>
            </TableBodyRow>
          {/await}
          {#if ownSchedules}
            {#each ownSchedules as schedule}
              <TableBodyRow>
                <TableBodyCell>{schedule.room}</TableBodyCell>
                <TableBodyCell>
                  {schedule.section}
                </TableBodyCell>
                <TableBodyCell>
                  {schedule.subject.code}
                </TableBodyCell>
                <TableBodyCell>
                  {schedule.start_time} - {schedule.end_time}
                </TableBodyCell>
                <TableBodyCell>{schedule.day_of_week}</TableBodyCell>
                <TableBodyCell class="text-center">
                  <Button
                    on:click={() => handleEdit(schedule)}
                    size="xs"
                    color="dark"
                    outline>Edit</Button
                  >
                  <Button
                    on:click={() => confirmDelete(schedule)}
                    size="xs"
                    color="red"
                    outline>Delete</Button
                  >
                </TableBodyCell>
              </TableBodyRow>
            {:else}
              <TableBodyRow>
                <TableBodyCell colspan={6} class="text-center">
                  No schedules found.
                </TableBodyCell>
              </TableBodyRow>
            {/each}
          {/if}
        </Table>
      </div>
      {#if hideDrawer}
        <section class="w-full text-center my-3">
          <Button icon={true} tag="a" target="_blank" href={`#/scheduler/print/${semester_id}/${teacher_id}`}>
            <PrinterOutline size="lg" />
            Print Schedule
          </Button>
        </section>
      {/if}
    </div>
  {/if}
  <ConfirmModal
    on:continue={handleDelete}
    on:cancel={() => (deleteItem = false)}
    message="Delete this schedule now?"
    open={deleteItem}
  />
</Page>

<style lang="postcss">
  @import "./scheduler.v1.9.css";
</style>
