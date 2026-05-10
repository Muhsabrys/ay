(function () {
    function getPath(obj, path) {
        if (!obj || !path) return undefined;
        return path.split('.').reduce(function (acc, key) {
            if (acc === undefined || acc === null) return undefined;
            if (/^\d+$/.test(key)) return acc[Number(key)];
            return acc[key];
        }, obj);
    }

    function text(el, value) {
        if (!el || value === undefined || value === null) return;
        el.textContent = String(value);
    }

    function html(el, value) {
        if (!el || value === undefined || value === null) return;
        el.innerHTML = String(value);
    }

    function setIfExists(id, value) {
        text(document.getElementById(id), value);
    }

    function populateIndex(cv) {
        setIfExists("indexHeroTagline", cv.profile && cv.profile.title ? cv.profile.title : "");
        setIfExists("indexQuote", cv.about && cv.about.summary ? cv.about.summary : "");

        var leadership = getPath(cv, "about.appointments.1");
        if (leadership) {
            setIfExists("indexHighlightLeadership", leadership.title + " (" + leadership.period + ")");
        }

        var award = getPath(cv, "about.awards.0");
        if (award) {
            setIfExists("indexHighlightRecognition", award.name + ", " + award.institution + " (" + award.year + ")");
        }

        var focus = getPath(cv, "research.research_interests.6");
        if (focus) {
            setIfExists("indexHighlightResearch", focus);
        }
    }

    function populateAbout(cv) {
        var p1 = document.getElementById("aboutBio1");
        var p2 = document.getElementById("aboutBio2");
        var p3 = document.getElementById("aboutBio3");

        if (p1 && cv.about && cv.about.summary) {
            p1.textContent = cv.about.summary;
        }

        var edu0 = getPath(cv, "about.education.0");
        var edu1 = getPath(cv, "about.education.1");
        if (p2 && edu0 && edu1) {
            p2.textContent = "He holds a " + edu0.degree + " (" + edu0.year + ") and an " + edu1.degree + " (" + edu1.year + "), both from " + edu0.institution + ".";
        }

        var ap0 = getPath(cv, "about.appointments.0");
        var ap1 = getPath(cv, "about.appointments.1");
        if (p3 && ap0 && ap1) {
            p3.textContent = "He currently serves as " + ap0.title + " and " + ap1.title + " at Indiana University.";
        }

        var expertiseWrap = document.getElementById("aboutExpertiseList");
        if (expertiseWrap && cv.profile && Array.isArray(cv.profile.areas)) {
            expertiseWrap.innerHTML = "";
            cv.profile.areas.slice(0, 8).forEach(function (area) {
                var span = document.createElement("span");
                span.className = "px-4 py-2 bg-deep-blue text-white text-xs font-semibold uppercase tracking-widest rounded-sm";
                span.textContent = area;
                expertiseWrap.appendChild(span);
            });
        }
    }

    function populateResearch(cv) {
        var wip = document.getElementById("researchWipList");
        if (wip && cv.research && Array.isArray(cv.research.works_in_progress)) {
            wip.innerHTML = "";
            cv.research.works_in_progress.slice(0, 4).forEach(function (item) {
                var p = document.createElement("p");
                p.textContent = item.title + (item.status ? " (" + item.status + ")" : "");
                wip.appendChild(p);
            });
        }
    }

    function populateTeaching(cv) {
        setIfExists("teachingSummary", getPath(cv, "teaching.teaching_summary"));

        var list = document.getElementById("teachingCoursesList");
        if (list && cv.teaching && Array.isArray(cv.teaching.content_courses_taught)) {
            list.innerHTML = cv.teaching.content_courses_taught.slice(0, 6).join(", ") + ".";
        }
    }

    function populateService(cv) {
        setIfExists("serviceSummary", getPath(cv, "service.service_summary"));

        var events = document.getElementById("serviceEvents");
        if (events && Array.isArray(getPath(cv, "service.service_to_iu.co_organized_events"))) {
            var items = getPath(cv, "service.service_to_iu.co_organized_events").slice(0, 5).map(function (e) {
                return e.event + " (" + e.date + ")";
            });
            events.textContent = items.join(", ") + ".";
        }
    }

    function populateContact(cv) {
        setIfExists("contactName", getPath(cv, "profile.name"));
        setIfExists("contactTitle", getPath(cv, "profile.title"));
        setIfExists("contactAffiliation", getPath(cv, "profile.affiliation"));
        setIfExists("contactOffice", getPath(cv, "profile.office"));

        var email = getPath(cv, "profile.email");
        if (email) {
            var clean = String(email).replace(/\[|\]|\(mailto:|\)/g, "").replace(/^.*?@/, function (m) {
                return m;
            });
            var match = clean.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
            var address = match ? match[0] : "ayouseif@iu.edu";
            var emailLinks = document.querySelectorAll(".cv-email-link");
            emailLinks.forEach(function (a) {
                a.textContent = address;
                a.setAttribute("href", "mailto:" + address);
            });
        }

        var interests = document.getElementById("contactInterests");
        if (interests && Array.isArray(getPath(cv, "profile.areas"))) {
            interests.innerHTML = "";
            getPath(cv, "profile.areas").slice(0, 6).forEach(function (area) {
                var li = document.createElement("li");
                li.className = "flex items-start";
                li.innerHTML = '<i class="fas fa-check text-gold mt-1 mr-3" aria-hidden="true"></i><span>' + area + "</span>";
                interests.appendChild(li);
            });
        }
    }

    fetch("cv.json")
        .then(function (res) { return res.json(); })
        .then(function (cv) {
            populateIndex(cv);
            populateAbout(cv);
            populateResearch(cv);
            populateTeaching(cv);
            populateService(cv);
            populateContact(cv);
        })
        .catch(function () {
            // Keep existing static content as fallback.
        });
})();
