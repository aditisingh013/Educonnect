// Sidebar Toggle
const menuIcon = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");

menuIcon.addEventListener("mouseover", () => {
    sidebar.style.left = "0";
});

sidebar.addEventListener("mouseleave", () => {
    sidebar.style.left = "-250px";
});

// Form Handling
document.getElementById("tutor-form").addEventListener("submit", function (event) {
    event.preventDefault();
    alert("Thank you! Your application has been submitted.");
});
