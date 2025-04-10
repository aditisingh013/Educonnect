var app = angular.module('tutorProfileApp', []);

app.controller('TutorProfileController', function($scope) {
    $scope.profile = {
        tutorId: "TUT12345",
        name: "Dr. Sarah Johnson",
        education: "Ph.D. in Mathematics, Stanford University",
        resume: "resume.pdf",
        specialization: "Mathematics & Physics Expert",
        experience: 8,
        location: "New York, United States",
        languages: "English, Spanish",
        rating: "4.8",
        subjects: ["Mathematics", "Physics", "Calculus", "Statistics"],
        about: "I am a passionate educator with a Ph.D. in Mathematics and over 8 years of teaching experience. I specialize in making complex mathematical concepts easy to understand and enjoy helping students build confidence in their abilities.",
        availability: "Monday to Friday: 3 PM - 8 PM\nSaturday: 10 AM - 4 PM",
        hourlyRate: 45,
        history: [
            {
                subject: "Mathematics",
                studentName: "John Doe",
                userId: "STU123",
                date: "2024-03-15"
            },
            {
                subject: "Physics",
                studentName: "Jane Smith",
                userId: "STU456",
                date: "2024-03-14"
            },
            {
                subject: "Calculus",
                studentName: "Mike Johnson",
                userId: "STU789",
                date: "2024-03-13"
            }
        ]
    };

    $scope.sidebar = {
        text: "Dedicated mathematics and physics tutor committed to helping students excel in their academic journey."
    };
}); 