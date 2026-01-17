import { ComponentFixture, TestBed } from '@angular/core/testing';
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
    coursesServiceSpy = jasmine.createSpyObj<CoursesService>('CoursesService', ['findAllCourses'])
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
    
    // Ask Alan - Would you keep both expect methods?
    expect(tabs.length).toBe(2, "Unexpected number of tabs found");
    expect(labels).toEqual(['Beginners', 'Advanced']);
  });

  it("should display advanced courses when tab clicked", () => {
    coursesServiceSpy.findAllCourses.and.returnValue(
      of(setupCourses())
    );
    fixture.detectChanges();

    const tabs = fixture.debugElement.queryAll(By.css(".mdc-tab"));
    
    tabs[1].nativeElement.click();
    // click(tabs[1]); // utility function
    fixture.detectChanges(); // Update the dom after click

    const cardTitles = fixture.debugElement.queryAll(By.css(".mat-mdc-card-title"));
    expect(cardTitles.length).toBeGreaterThan(0, "Could not find card titles");
    expect(cardTitles[0].nativeElement.textContent).toBe("Angular Security Course");
  }); // TO BE CONTINUED IN THE NEXT COURSE SECTION

});
