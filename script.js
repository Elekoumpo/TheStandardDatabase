let mentors = [];
let filteredMentors = [];

function createCheckbox(name, value) {
  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.name = name;
  checkbox.value = value;
  label.appendChild(checkbox);
  label.appendChild(document.createTextNode(value));
  return label;
}

function createFilterCheckboxes(data, filterContainerId, filterKey) {
  const uniqueValues = [
    ...new Set(
      data.map((mentor) => {
        if (filterKey === "location.country") {
          return mentor.location;
        } else {
          return mentor[filterKey];
        }
      })
    ),
  ];

  const filterContainer = document.getElementById(filterContainerId);

  uniqueValues.forEach((value) => {
    const checkbox = createCheckbox(filterContainerId, value);
    filterContainer.appendChild(checkbox);
    filterContainer.appendChild(document.createElement("br"));
  });
}

function applyFilters() {
  const minAge = parseInt(document.getElementById("min-age").value);
  const maxAge = parseInt(document.getElementById("max-age").value);
  const locationCheckboxes = document.querySelectorAll(
    "#location-filters input[type='checkbox']:checked"
  );
  const industryCheckboxes = document.querySelectorAll(
    "#industry-filters input[type='checkbox']:checked"
  );

  const selectedLocations = Array.from(locationCheckboxes).map(
    (checkbox) => checkbox.value
  );
  const selectedIndustries = Array.from(industryCheckboxes).map(
    (checkbox) => checkbox.value
  );

  filteredMentors = mentors.filter((mentor) => {
    const ageInRange = mentor.age >= minAge && mentor.age <= maxAge;
    const locationMatches =
      selectedLocations.length === 0 ||
      selectedLocations.includes(mentor.location);
    const industryMatches =
      selectedIndustries.length === 0 ||
      selectedIndustries.includes(mentor.industry);

    return ageInRange && locationMatches && industryMatches;
  });

  displayMentors(filteredMentors);
}

function resetFilters() {
  document.getElementById("min-age").value = 0;
  document.getElementById("max-age").value = 100;

  const locationCheckboxes = document.querySelectorAll(
    "#location-filters input[type='checkbox']"
  );
  const industryCheckboxes = document.querySelectorAll(
    "#industry-filters input[type='checkbox']"
  );

  locationCheckboxes.forEach((checkbox) => (checkbox.checked = false));
  industryCheckboxes.forEach((checkbox) => (checkbox.checked = false));

  displayMentors(mentors);
}

function openModal(mentor) {
  const modal = document.getElementById("modal");
  modal.style.display = "block";
  modal.style.visibility = "visible";

  const modalPhoto = document.querySelector(".modal-photo");
  modalPhoto.src = mentor.photoUrl; // use the photoUrl from the mentor data
  modalPhoto.alt = `${mentor.firstName} ${mentor.lastName}`;

  document.querySelector(
    ".modal-name"
  ).textContent = `${mentor.firstName} ${mentor.lastName}`;
document.querySelector(".modal-age").innerHTML = `<span class="bold">Age:</span> ${mentor.age}`;

document.querySelector(".modal-location").innerHTML = `<span class="bold">Location:</span> ${mentor.location}`;

document.querySelector(".modal-role").innerHTML = `<span class="bold">Role:</span> ${mentor.role}`;
 document.querySelector(".modal-industry").innerHTML = `<span class="bold">Industry:</span> ${mentor.industry}`;
const email = mentor.email.replace("Contact:", "");

document.querySelector(".modal-description").innerHTML = `<span class="bold">Bio:</span> ${mentor.description}<br><br><div class="wrap_"><a href="mailto:${mentor.email}?subject=Connecting%20from%20The%20Standard" class="email_">Contact</a><a href="${mentor.instagram}" class="email_" target="_blank" style="margin-left:3px">Social</a></div>`;




}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
  modal.style.visibility = "hidden";
  const readMoreButtons = document.querySelectorAll(".read-more");
  readMoreButtons.forEach((button) => {
    button.style.display = "block";
  });
}

async function fetchMentorData(mentorId) {
  const response = await fetch(`UserData/${mentorId}/${mentorId}.json`);
  const data = await response.json();
  return data;
}

// Add this function before the createMentorCard function
async function loadImage(element) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = element.dataset.src;
    img.alt = element.dataset.alt;
    img.onload = () => {
      element.src = img.src;
      element.alt = img.alt;
      resolve();
    };
    img.onerror = () => {
      reject(new Error('Failed to load image: ' + element.dataset.src));
    };
  });
}

function createMentorCard(mentor) {
  const mentorCard = document.createElement("div");
  mentorCard.classList.add("mentor-card");
  
  const img = document.createElement("img");
  img.src = mentor.photoUrl; // use the photoUrl from the mentor data
  img.alt = `${mentor.firstName} ${mentor.lastName}`;
  mentorCard.appendChild(img);

  const mentorInfo = document.createElement("div");
  mentorInfo.classList.add("mentor-info");

  const mentorName = document.createElement("p");
  mentorName.classList.add("mentor-name");
  mentorName.textContent = `${mentor.firstName} ${mentor.lastName}`;
  mentorInfo.appendChild(mentorName);

  const mentorRole = document.createElement("p");
  mentorRole.classList.add("mentor-role");
  mentorRole.textContent = mentor.role;
  mentorInfo.appendChild(mentorRole);

  mentorCard.appendChild(mentorInfo);

  const readMore = document.createElement("div");
  readMore.classList.add("read-more");
  readMore.textContent = "Read More";
  readMore.addEventListener("click", () => openModal(mentor));
  mentorCard.appendChild(readMore);

  mentorCard.addEventListener("click", () => openModal(mentor));

  mentorCard.style.position = "relative";

  return mentorCard;
}

const observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadImage(entry.target);
        observer.unobserve(entry.target);
      }
    });
  },
  {
    rootMargin: "0px 0px 200px 0px",
  }
);


const mentorsPerPage = 40;

async function displayMentors(mentorsToDisplay, currentPage = 1) {
  const mentorContainer = document.querySelector(".mentor-container");
  mentorContainer.innerHTML = "";

  const startIndex = (currentPage - 1) * mentorsPerPage;
  const endIndex = startIndex + mentorsPerPage;

  if (mentorsToDisplay.length === 0) {
    const noMentorsMessage = document.createElement("p");
    noMentorsMessage.textContent = "No users found that match your filters.";
    noMentorsMessage.classList.add("no-mentors-message");
    mentorContainer.appendChild(noMentorsMessage);
  } else {
    for (const mentor of mentorsToDisplay.slice(startIndex, endIndex)) {
      const mentorCard = createMentorCard(mentor);
      mentorContainer.appendChild(mentorCard);
      observer.observe(mentorCard.querySelector("img"));
    }
  }

  displayPaginationButtons(mentorsToDisplay, currentPage);
}

async function loadMentors() {
  const response = await fetch('users.json');
  mentors = await response.json();

  createFilterCheckboxes(mentors, "location-filters", "location");
  createFilterCheckboxes(mentors, "industry-filters", "industry");

  displayMentors(mentors);
}

loadMentors();
const ageSlider = document.getElementById("age-range");
const ageRange = [15, 100]; // This is for min and max on the age filter slider
noUiSlider.create(ageSlider, {
  start: ageRange,
  connect: true,
  step: 1,
  range: {
    min: ageRange[0],
    max: ageRange[1],
  },
});


// Search functionality
document.getElementById('search-button').addEventListener('click', function() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const filteredMentors = mentors.filter(mentor => 
        mentor.firstName.toLowerCase().includes(searchInput) || 
        mentor.lastName.toLowerCase().includes(searchInput)
    );
    displayMentors(filteredMentors);
});

// Handle 'Enter' key press in the search input field
document.getElementById('search-input').addEventListener('keyup', function(event) {
  if (event.key === 'Enter') {
      document.getElementById('search-button').click();
  }
});





function displayPaginationButtons(mentorsToDisplay, currentPage) {
  const paginationContainer = document.querySelector(".pagination-container");
  if (!paginationContainer) {
    const newPaginationContainer = document.createElement("div");
    newPaginationContainer.classList.add("pagination-container");
    document.querySelector(".content").appendChild(newPaginationContainer);
  }

  const totalPages = Math.ceil(mentorsToDisplay.length / mentorsPerPage);

  paginationContainer.innerHTML = "";

  const firstButton = document.createElement("button");
  firstButton.textContent = "First";
  firstButton.addEventListener("click", () => displayMentors(mentorsToDisplay, 1));
  paginationContainer.appendChild(firstButton);

  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.addEventListener("click", () => displayMentors(mentorsToDisplay, Math.max(currentPage - 1, 1)));
  paginationContainer.appendChild(prevButton);

  const startPage = Math.max(1, currentPage - 1);
  const endPage = Math.min(totalPages, currentPage + 1);

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    if (i === currentPage) {
      pageButton.disabled = true;
    }
    pageButton.addEventListener("click", () => displayMentors(mentorsToDisplay, i));
    paginationContainer.appendChild(pageButton);
  }

  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.addEventListener("click", () => displayMentors(mentorsToDisplay, Math.min(currentPage + 1, totalPages)));
  paginationContainer.appendChild(nextButton);

  const lastButton = document.createElement("button");
  lastButton.textContent = "Last";
  lastButton.addEventListener("click", () => displayMentors(mentorsToDisplay, totalPages));
  paginationContainer.appendChild(lastButton);
}


ageSlider.noUiSlider.on("update", function (values, handle) {
  document.getElementById("min-age").value = parseInt(values[0]);
  document.getElementById("max-age").value = parseInt(values[1]);
  document.getElementById("min-age-label").textContent = parseInt(values[0]);
  document.getElementById("max-age-label").textContent = parseInt(values[1]);
});

document.querySelector(".close").addEventListener("click", closeModal);

window.addEventListener("click", (event) => {
  const modal = document.getElementById("modal");
  if (event.target === modal) {
    closeModal();
  }
});
function sortMentors(criteria) {
  switch (criteria) {
    case "alphabetically":
      mentors.sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toUpperCase();
        const nameB = `${b.firstName} ${b.lastName}`.toUpperCase();
        return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
      });
      break;
    case "age-highest":
      mentors.sort((a, b) => b.age - a.age);
      break;
    case "age-lowest":
      mentors.sort((a, b) => a.age - b.age);
      break;
    case "industry":
      mentors.sort((a, b) => {
        const industryA = a.industry.toUpperCase();
        const industryB = b.industry.toUpperCase();
        return industryA < industryB ? -1 : industryA > industryB ? 1 : 0;
      });
      break;
    case "location":
      mentors.sort((a, b) => {
        const locationA = a.location.country.toUpperCase();
        const locationB = b.location.country.toUpperCase();
        return locationA < locationB ? -1 : locationA > locationB ? 1 : 0;
      });
      break;
    default:
      break;
  }
}
document.getElementById("sort-options").addEventListener("change", (event) => {
  sortMentors(event.target.value);
  applyFilters();
});
function toggleFilterSortSection(section) {
  const filterSection = document.querySelector(".filter-container");
  const sortSection = document.querySelector(".sort-container");

  if (section === "filter") {
    if (
      filterSection.style.display === "none" ||
      filterSection.style.display === ""
    ) {
      filterSection.style.display = "block";
      sortSection.style.display = "none";
    } else {
      filterSection.style.display = "none";
    }
  } else if (section === "sort") {
    if (
      sortSection.style.display === "none" ||
      sortSection.style.display === ""
    ) {
      sortSection.style.display = "block";
      filterSection.style.display = "none";
    } else {
      sortSection.style.display = "none";
    }
  }
}

function toggleScrolling(disable) {
  if (disable) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
}

function toggleFilterSortMenu() {
  const filterContainer = document.querySelector(".filter-container");
  const sortContainer = document.querySelector(".sort-container");

  if (
    filterContainer.style.display === "none" ||
    filterContainer.style.display === ""
  ) {
    filterContainer.style.display = "block";
    sortContainer.style.display = "block";
    filterContainer.style.top = "50px";
    sortContainer.style.top = "90px";
    toggleScrolling(true);

    const filterOptions = document.querySelector(".filter-options");
    const sortOptions = document.querySelector(".sort-options");
    filterOptions.style.display = "block";
    sortOptions.style.display = "block";
  } else {
    filterContainer.style.display = "none";
    sortContainer.style.display = "none";
    toggleScrolling(false);
  }
}

document.querySelector(".close").addEventListener("click", closeModal);
document.getElementById("apply-filters").addEventListener("click", function() {
  applyFilters();

  // Check if the viewport width is less than or equal to 768px
  if (window.innerWidth <= 768) {
    // Close the filter menu
    toggleFilterSortMenu();
  }
});
document.getElementById("reset-filters").addEventListener("click", resetFilters);
