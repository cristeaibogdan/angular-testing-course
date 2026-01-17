import { TestBed } from "@angular/core/testing";
import { CoursesService } from "./courses.service";
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse, provideHttpClient } from "@angular/common/http";
import { COURSES, findLessonsForCourse } from "../../../../server/db-data";
import { Course } from "../model/course";

describe("CourseService", () => {
  let underTest: CoursesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CoursesService,
        provideHttpClient(), // real HttpClient provider. Order is important!
        provideHttpClientTesting() // testing version which overrides HttpClient
      ]
    });

    underTest = TestBed.inject(CoursesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => { // Checks that all HTTP requests made by the service were expected and flushed
    httpTestingController.verify();
  });

  it("should retrieve all courses", () => {
    underTest.findAllCourses().subscribe(courses => {
      expect(courses).toBeTruthy("No courses returned");
      expect(courses.length).toBe(12, "Incorrect number of courses");

      const course = courses.find(course => course.id ==12);
      expect(course.titles.description).toBe("Angular Testing Course");
    });

    const req = httpTestingController.expectOne({
      method: "GET",
      url: "/api/courses"
    });
   
    /**
     * findAllCourses() uses the mock implementation of the httpClient which does not issue http requests.
     * Using the httpTestingController we are going to create a mock request and 
     * have it return data by calling flush() */
    req.flush({payload: Object.values(COURSES)}); // what data our mock request will return
  });
  
  it("should find a course by id", () => {
    underTest.findCourseById(3).subscribe(course => {
      expect(course.id).toBe(3);
    });

    const req = httpTestingController.expectOne({
      method: "GET",
      url: "/api/courses/3"
    });

    req.flush(COURSES[3]); // what data our mock request will return
  });

  it("should save the course data", () => { // data modification test
    const courseUpdate: Partial<Course> = {titles: {description: "Testing Course"}};

    underTest.saveCourse(12, courseUpdate).subscribe(course => {
      expect(course.id).toBe(12);
      expect(course.titles.description).toBe("Testing Course");
    });

    const req = httpTestingController.expectOne({
      method: "PUT",
      url: "/api/courses/12"
    });

    req.flush({
      ...COURSES[12],
      ...courseUpdate
    });
  });

  it("should give an error if save course fails", () => {
    const courseUpdate: Partial<Course> = {titles: {description: "Testing Course"}};

    underTest.saveCourse(12, courseUpdate).subscribe({
      next: () => fail("course save operation should have failed"),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpTestingController.expectOne({
      method: "PUT",
      url: "/api/courses/12"
    });

    req.flush("We can put '', null or a personalized error object here",
      { status: 500, statusText: "Internal Server Error" }
    );
    // req.error( // Use when only when you want to simulate a network / transport failure
    //   new ProgressEvent("error"),
    //   { status: 500, statusText: "Internal Server Error" }
    // );
  });

  it("should find a list of lessons", () => {
    underTest.findLessons(12).subscribe(lessons => {
      expect(lessons.length).toBe(3);
    });

    const req = httpTestingController.expectOne(
      req => req.method === 'GET' && req.url === '/api/lessons'        
    );
    expect(req.request.params.get("courseId")).toEqual("12");
    expect(req.request.params.get("filter")).toEqual("");
    expect(req.request.params.get("sortOrder")).toEqual("asc");
    expect(req.request.params.get("pageNumber")).toEqual("0");
    expect(req.request.params.get("pageSize")).toEqual("3");

    req.flush({
      payload: findLessonsForCourse(12).slice(0,3)
    });
  });
});
