describe('Example Cypress site', () => {

  it('passes', () => {
    cy.visit('https://example.cypress.io');
  });
});

describe('template spec', () => {

  beforeEach(() => {
    cy.intercept(
      'GET', 
      '/api/courses', 
      { fixture: 'courses.json' }
    ).as('getCourses'); // Will return the courses.json

    cy.visit("/"); // baseUrl from cypress.config.ts
    cy.wait('@getCourses');
  });

  it('should display a list of courses', () => {    
    cy.contains("All Courses");
    cy.get('.mat-mdc-card-title').should("have.length", 9);
  });

  it('should display the advanced courses', () => {    
    cy.get('.mdc-tab').should("have.length", 2);
    cy.get('.mdc-tab').last().click();

    cy.get('.mat-mdc-tab-body-active .mat-mdc-card-title')
      .should("have.length.greaterThan", 1);

    cy.get('.mat-mdc-tab-body-active .mat-mdc-card-title')
      .first()
      .should("contain", "Angular Security Course");
  });
});