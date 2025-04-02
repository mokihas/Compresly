// script.js

/**
 * This file contains JavaScript code for the website.
 */

(function() {
  'use strict';  //  Enable strict mode for safer JavaScript

  // Example:  Smooth scrolling for anchor links
  function smoothScroll(targetId) {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth' // Use smooth scrolling
      });
    }
  }

  // Example: Event listener for a button click (replace with your actual button ID)
  const myButton = document.getElementById('myButton'); //  Change 'myButton' to the actual ID
  if (myButton) { // Check if the button exists
    myButton.addEventListener('click', function() {
      alert('Button clicked!'); //  Replace this with your desired action
      //  You could call another function here, like:
      //  updateContent('New content!');
    });
  }

    // Example: Form submission handler (replace with your form's ID)
    const myForm = document.getElementById('myForm'); // Change 'myForm' to your form's ID
    if (myForm) {
        myForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission

            // Get form data
            const formData = new FormData(myForm);
            const name = formData.get('name'); //  Replace 'name' with your input field's name
            const email = formData.get('email'); // Replace 'email' with your input field's name
            const message = formData.get('message');

            // Basic validation (you should do more robust validation)
            if (!name || !email || !message) {
                alert('Please fill in all fields.');
                return;
            }

            //  You would typically send this data to a server using fetch or XMLHttpRequest
            console.log('Name:', name);
            console.log('Email:', email);
            console.log('Message:', message);

            //  Example: Display a success message (replace with your desired action)
            alert('Form submitted successfully! (Data sent to console)');
            myForm.reset(); // Clear the form
        });
    }


  // Example: Function to update content on the page
  function updateContent(newContent) {
    const contentElement = document.getElementById('contentArea'); //  Change 'contentArea'
    if (contentElement) {
      contentElement.textContent = newContent;
    }
  }

    // Example: Toggle a class on an element (for example, for a mobile menu)
    const menuButton = document.getElementById('menuButton'); //  Change to your menu button ID
    const navElement = document.querySelector('nav'); // Change to your nav selector
    if (menuButton && navElement) {
        menuButton.addEventListener('click', function() {
            navElement.classList.toggle('active'); //  Toggles the class 'active'
        });
    }

  //  Initialize the code (if needed)
  function init() {
    //  Any code that needs to run when the page loads
    console.log('JavaScript initialized.');
    // Example: smooth scroll to a section.
    const homeLink = document.querySelector('a[href="#home"]');
    if(homeLink){
        homeLink.addEventListener('click', function(event){
            event.preventDefault();
            smoothScroll('home');
        })
    }
  }

  //  Add event listener for DOMContentLoaded to run init() when the DOM is ready
  document.addEventListener('DOMContentLoaded', init);
})();
