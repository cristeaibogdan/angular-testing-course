import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { setupCourses } from '../common/setup-test-data';
import { CoursesModule } from '../courses.module';
import { CoursesCardListComponent } from './courses-card-list.component';

/**
 * We are testing a presentation component, which takes data and displays it.
 * Due to their simplicity, many projects choose not to test it.
 * This is a valid approach, but we'll test them anyway because of 2 reasons:
 *  a. Test coverage requirements that are out of your control
 *  b. To show how an angular test can validate the content of the DOM.
 */
describe('CoursesCardListComponent', () => {
  let fixture: ComponentFixture<CoursesCardListComponent>;
  let component: CoursesCardListComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      /**
       * We import everything from the CoursesModule, but this is sketchy, 
       * because Modules are not used anymore in Angular.
       * We use this because the component is NOT standalone.
       * Usually bad in tests, to import a WHOLE module just for the component.
       */
      imports: [
        CoursesModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CoursesCardListComponent);
    component = fixture.componentInstance;
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should display the course list", () => {
    component.courses = setupCourses();
    // console.log(fixture.nativeElement.outerHTML); // We can see that the template is empty
    fixture.detectChanges(); // Ensures the template is updated with the latest data

    const cards = fixture.debugElement.queryAll(By.css(".course-card"));

    expect(cards.length).toBe(12);
  });

  it("should display the first course", () => {
    component.courses = setupCourses();
    fixture.detectChanges();

    // const course = component.courses[0];
    
    const card = fixture.debugElement.query(By.css(".course-card"));
    const title = card.query(By.css("mat-card-title"));
    const image = card.query(By.css("img"));

    // expect(title.nativeElement.textContent).toBe(course.titles.description);
    // expect(image.nativeElement.src).toBe(course.iconUrl);

    // Or like this, to see what you are asserting:
    expect(title.nativeElement.textContent).toBe("Angular Testing Course");
    expect(image.nativeElement.src).toBe("https://s3-us-west-1.amazonaws.com/angular-university/course-images/angular-testing-small.png");
  });

});


