import { fakeAsync, flush, flushMicrotasks, tick } from "@angular/core/testing";
import { delay, of } from "rxjs";

describe('Async Testing Examples', () => {
  it("Async test example with Jasmine done()", (done: DoneFn) => { // To be avoided
    let test = false;

    setTimeout(() => { // Simulate some component that internally uses setTimeout
      console.log('Running assertions')
      test = true;
      expect(test).toBeTruthy();

      done();
    }, 1_000);
  });

  /**
   * Recommended - waits for async calls to finish before asserting.
   * Zone - an execution context that persists across async tasks.
   * 
   * We need a test utility that handles the execution of our test in a zone,
   * which will detect all async calls in the code block and will wait for all of
   * them to complete before considering that this particular `it` is completed.
   * 
   * fakeAsync runs our test in a Zone and keeps track of all async operations.
   * The test can only be considered complete if the setTimeout() codeblock is executed.
   * 
   * Run assertions OUTSIDE the async function, just AFTER the tick() method.
   */
  it("Async test example with setTimeout()", fakeAsync(() => { 
    let test = false;

    setTimeout(() => { // Simulate some component that internally uses setTimeout
      console.log('Running assertions setTimeout()')
      test = true;
    }, 1_000);
    
    /**
     * Simulates passing of specific amount of time. Use when you need 
     * to test behavior at specific time intervals or verify intermediate states.
     */
    // tick(1_000);
    /**
     * Advances time until ALL pending timers complete. Use when you just 
     * want to execute all pending async tasks without caring about specific timing.
     */
    flush();
    expect(test).toBeTruthy();
  }));

  /**
   * Components that use browser async operations are a bit harder to test because
   * we don't have a clear indication of when the test will be finished.
   * 
   * We'll explore the topic of how to test Promises.
   * 
   * The order on which promises are executed by the javascript runtime when
   * compared to other async operations such as setTimeout().
   * 
   * Promise have priority over setTimeout.
   * They are 2 different types of async operations with their own queue:
   * a) Microtask - Promises
   * b) Macrotask or Task - setTimeout(), setInterval(), AJX calls, mouse clicks, ...
   * 
   * Microtasks are more lightweight and allow our runtime to be more responsive. 
   */
  it("Async test example with plain Promise", fakeAsync(() => { 
    let test = false;

    console.log('Creating promise');

    // setTimeout(() => { // Executes after the promise, not before.
    //   console.log('setTimeout() calback triggered')
    // });

    Promise.resolve().then(() => {
      console.log('Promise evaluated successfully');
      test = true;
    });
    
    console.log("Running test assertions");
    flushMicrotasks();
    expect(test).toBeTruthy();
  }));

  /**
   * We'll create a more complex example so you know when to call flush() or
   * flushMicrotasks().
   * 
   * We want to test at different times what the value of counter is.
   * We'll check if the counter is first at 10, and after at 11.
   */
  it("Async test example with Promise + setTimeout()", fakeAsync(() => { 
    let counter = 0;

    Promise.resolve().then(() => {
      counter += 10;
      setTimeout(() => {
        counter += 1;
      }, 1_000);
    });

    expect(counter).toBe(0);
    
    flushMicrotasks(); // empty the microtask queue that handles promises
    expect(counter).toBe(10);

    // tick(500); // Nothing should change, as we haven't reached 1_000
    // expect(counter).toBe(10);
    
    // tick(1_000); // We reached 1_000, so the counter should be 11
    // expect(counter).toBe(11);
        
    flush(); // Alternative - use straight flush to wait for task(setTimeout) to complete
    expect(counter).toBe(11);
  }));

  /**
   * Observables are build internally sometimes with promises, sometimes with operations
   * like setTimeout, setInterval. Many times they are purely synchronous code.
   */
  it("Async test example with Observables - synchronous", () => { 
    let test = false;
    
    console.log('Creating Observable');

    const test$ = of(test); // synchronous, it emits immediately.
    test$.subscribe(() => {
      test = true;
    });

    expect(test).toBeTruthy();
  });

  it("Async test example with Observables - async", fakeAsync(() => { 
    let test = false;
    
    console.log('Creating Observable');

    const test$ = of(test).pipe(delay(1_000)); // async because of delay which uses setTimeout()
    test$.subscribe(() => {
      test = true;
    });

    tick(1_000);
    // flush(); // flush won't work!
    expect(test).toBeTruthy();
  }));
});