import { CalculatorService } from "./calculator.service";
import { TestBed } from "@angular/core/testing";
import { LoggerService } from "./logger.service";

// Replace `describe` with `xdescribe` to disable the whole test suite
// To focus on a specific test suite, replace `describe` with `fdescribe`
describe("CalculatorService", () => {
  let underTest: CalculatorService;
  let loggerSpy: jasmine.SpyObj<LoggerService>; // interesting thing to look out for.

  beforeEach(() => {
    loggerSpy = jasmine.createSpyObj<LoggerService>("LoggerService", ["log"]);
    TestBed.configureTestingModule({
      providers: [
        CalculatorService, // even though it works without it being here, it should be added to avoid hidden coupling
        { provide: LoggerService, useValue: loggerSpy },
      ],
    });

    underTest = TestBed.inject(CalculatorService);
  });

  // Replace `it` with `xit` to disable the test
  // To focus on a specific test, replace `it` with `fit`
  it("should add two numbers", () => {
    const actual = underTest.add(2, 2);

    expect(actual).toBe(4, "unexpected add result");
    expect(loggerSpy.log).toHaveBeenCalledTimes(1);
  });

  it("should subtract two numbers", () => {
    const actual = underTest.subtract(2, 2);

    expect(actual).toBe(0, "unexpected subtraction result");
    expect(loggerSpy.log).toHaveBeenCalledTimes(1);
  });
});
