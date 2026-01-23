import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { CoursesModule } from '../courses.module';
import { HomeComponent } from './home.component';
import { CoursesService } from '../services/courses.service';
import { By } from '@angular/platform-browser';
import { setupCourses } from '../common/setup-test-data';
import { of } from 'rxjs';
import { click } from '../common/test-utils';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;
  let coursesServiceSpy: jasmine.SpyObj<CoursesService>;

  beforeEach(async () => {
    coursesServiceSpy = jasmine.createSpyObj<CoursesService>('CoursesService', ['findAllCourses']);
    await TestBed.configureTestingModule({
      /**
       * We import everything from the CoursesModule, but this is sketchy, 
       * because Modules are not used anymore in Angular.
       * We use this because the component is NOT standalone.
       * Usually bad in tests, to import a WHOLE module just for the component.
       */
      imports: [
        CoursesModule
      ],
      providers: [
        {
          provide: CoursesService,
          useValue: coursesServiceSpy
        }
      ]
    }).compileComponents();
  
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should display only beginner courses", () => {
    coursesServiceSpy.findAllCourses.and.returnValue(
      of(setupCourses().filter(course => course.category === "BEGINNER"))
    );
    fixture.detectChanges();

    const tabs = fixture.debugElement.queryAll(By.css(".mdc-tab"));

    expect(tabs.length).toBe(1, "Unexpected number of tabs found");
    expect(tabs[0].nativeElement.textContent).toBe("Beginners");     
  });

  it("should display only advanced courses", () => {
    coursesServiceSpy.findAllCourses.and.returnValue(
      of(setupCourses().filter(course => course.category === "ADVANCED"))
    );
    fixture.detectChanges();

    const tabs = fixture.debugElement.queryAll(By.css(".mdc-tab"));

    expect(tabs.length).toBe(1, "Unexpected number of tabs found");
    expect(tabs[0].nativeElement.textContent).toBe("Advanced");
  });

  it("should display both tabs", () => {
    coursesServiceSpy.findAllCourses.and.returnValue(
      of(setupCourses())
    );
    fixture.detectChanges();

    const tabs = fixture.debugElement.queryAll(By.css(".mdc-tab"));    
    const labels = tabs.map(tab => tab.nativeElement.textContent);
    
    // expect(tabs.length).toBe(2, "Unexpected number of tabs found"); //redundant, covered by next line.
    expect(labels).toEqual(['Beginners', 'Advanced']);
  });

  /**
   * Even though we have fixture.detectChanges() after simulating a user click()
   * we don't get the advanced courses reflected in the DOM and our test is failing.
   * 
   * What's going on?
   * 
   * The tab we click on ('Advanced') is performing an async operation while switching tabs.
   * The tab container is performing an asynchoronous operation while switching tabs.
   * Notice the small animation when switching tabs. 
   * This animation is produced by using the browser API request animation framwork.
   * It is one of the many browser async APIs. Examples of async browser operations:
   *  a. setTimeout
   *  b. setInterval
   *  c. http request, using the fetch() API
   * 
   * Why is our test failing?
   * 
   * The problem is that `mat-tab-group` is internally calling requestAnimationFrame() which is async.
   * The changes to our DOM won't apply immediately after we call detectChanges().
   * The container waits for the callback passed to requestAnimationFrame() to complete
   * before applying the changes to the DOM.
   * 
   * We can't write our assertions synchronously right after detectChanges().
   * 
   * One way is to simply call setTimeout() to wait for 500ms.
   */
  // it("should display advanced courses when tab clicked", (done: DoneFn) => {
  //   coursesServiceSpy.findAllCourses.and.returnValue(
  //     of(setupCourses())
  //   );
  //   fixture.detectChanges();

  //   const tabs = fixture.debugElement.queryAll(By.css(".mdc-tab"));
    
  //   tabs[1].nativeElement.click();
  //   // click(tabs[1]); // utility function
  //   fixture.detectChanges(); // Update the dom after click

  //   setTimeout(() => { // Bad, don't use it.
  //     const cardTitles = fixture.debugElement.queryAll(By.css(".mat-mdc-card-title"));
  //     expect(cardTitles.length).toBeGreaterThan(0, "Could not find card titles");
  //     expect(cardTitles[0].nativeElement.textContent).toBe("Angular Security Course");
  //     done();
  //   }, 500);
  // });

  /**
   * A more maintainable way is to use done. But this is bad too.
   */
  // it("should display advanced courses when tab clicked", (done: DoneFn) => {
  //   coursesServiceSpy.findAllCourses.and.returnValue(
  //     of(setupCourses())
  //   );
  //   fixture.detectChanges();

  //   const tabs = fixture.debugElement.queryAll(By.css(".mdc-tab"));
    
  //   tabs[1].nativeElement.click();
  //   fixture.detectChanges();

  //   setTimeout(() => { // Bad, don't use it.
  //     const cardTitles = fixture.debugElement.queryAll(By.css(".mat-mdc-card-title"));
  //     expect(cardTitles.length).toBeGreaterThan(0, "Could not find card titles");
  //     expect(cardTitles[0].nativeElement.textContent).toBe("Angular Security Course");
  //     done();
  //   }, 500);
  // });

  // Best alternative
  it("should display advanced courses when tab clicked - fakeAsync", fakeAsync(() => {
    coursesServiceSpy.findAllCourses.and.returnValue(
      of(setupCourses())
    );
    fixture.detectChanges();
      // ✅ Runs ngOnInit(), subscribes to the spy, updates component state
      // ✅ Renders the initial DOM (Beginners tab content)
      // Note: Angular does not automatically update the DOM for async changes. We need to do it.
    
    const tabs = fixture.debugElement.queryAll(By.css(".mdc-tab"));    
    click(tabs[1]);
    fixture.detectChanges();
      // ✅ Tells Angular to re-render the component after the click
      // ⚠️ Important: the click schedules **async tab selection tasks** (animations, requestAnimationFrame)
      // Angular template updates may still not be fully reflected until async tasks complete
    flush();
      // ✅ Clears all pending tasks (timers, animations)
      // ✅ Ensures Material tab switch finishes
      // ⚠️ Now the active tab content is fully rendered in the DOM

    const cardTitles = fixture.debugElement.queryAll(By.css(".mat-mdc-tab-body-active .mat-mdc-card-title"));
    expect(cardTitles.length).toBeGreaterThan(0, "Could not find card titles");
    expect(cardTitles[0].nativeElement.textContent).toBe("Angular Security Course - Web Security Fundamentals");
  }));

  /**
   * async wraps the code into a TestZone.
   * It is very similar to fakeAsync but it works in a different zone.
   * async will detect all asynchronous operations inside the code block.
   * 
   * async can't call flush() or tick(), we don't have full control of the emptying
   * of tasks and microtasks queue.
   * 
   * The async will keep track of the async operations of the code block.
   * The async will call the callback fixture.whenStable() whenever all the
   * async operations in the codeblock are completed. It will return as a Promise,
   * and we can write the assertions there.
   * 
   * The async testZone is an alternative but it is clearly not as convenient as faksAsync.
   * === Doesn't work properly due to some angular material stuff that changed ===
   * 
   * fakeAsync should be used as much as possible.
   */
  xit("should display advanced courses when tab clicked - async", async () => {
    coursesServiceSpy.findAllCourses.and.returnValue(
      of(setupCourses())
    );
    fixture.detectChanges();
    
    const tabs = fixture.debugElement.queryAll(By.css(".mdc-tab"));    
    click(tabs[1]);
    fixture.detectChanges();

    await fixture.whenStable();

    console.log("called whenStable()");
    const cardTitles = fixture.debugElement.queryAll(By.css(".mat-mdc-tab-body-active .mat-mdc-card-title"));
    expect(cardTitles.length).toBeGreaterThan(0, "Could not find card titles");
    expect(cardTitles[0].nativeElement.textContent).toBe("Angular Security Course - Web Security Fundamentals");
  });
});
