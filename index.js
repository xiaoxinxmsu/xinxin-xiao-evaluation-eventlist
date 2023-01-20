const API = (() => {
	const URL = "http://localhost:3000/events";
	
    const getEvents = () => {
		return fetch(URL).then((res) => res.json());
	};
	
	const postEvent = (newEvent) => {
		return fetch(URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(newEvent),
		}).then((res) => res.json());
	};

    const editEvent = (id, newEvent) => {
        return fetch(`${URL}/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(newEvent),
		})
        .then((res) => res.json())
        .catch(console.log);
    }
	
	const removeEvent = (id) => {
		return fetch(`${URL}/${id}`, {
			method: "DELETE",
		})
        .then((res) => res.json())
        .catch(console.log);
	};
	
    return {
		getEvents,
		postEvent,
        editEvent,
		removeEvent,
	};
})();

//----------------------------------------

class EventModel {
	#events;
    constructor() {
		this.#events = [];
	}
	
	setEvents(events) {
		this.#events = events;
	}
	
	getEvents() {
		return this.#events;
	}
	
	addEvent(newEvent) {
        this.#events.push(newEvent);
	}

    editEvent(id, newEvent) {
        this.removeEvent(id);
        this.#events.push(newEvent);
    }
	
	removeEvent(id) {
        this.#events = this.#events.filter((event) => event.id !== +id);
	}
}

//----------------------------------------
	
class EventView {
	constructor() {
        this.addEventButton = document.querySelector(".event-list-app__btn")
        this.table = document.querySelector("table");
        this.tableBody = document.querySelector("tbody")
	}
    
    renderEvent(event) {
    	const eventElem = document.createElement("tr");
	  	eventElem.classList.add("event");
	  	eventElem.setAttribute("id", "event_" + event.id);
	
		  const eventNameElem = document.createElement("td");
		  eventNameElem.classList.add("event__event-name");
		  eventNameElem.textContent = event.eventName;
	
		  const startDateElem = document.createElement("td");
		  startDateElem.classList.add("event__start-date");
      startDateElem.textContent = event.startDate;

      const endDateElem = document.createElement("td");
		  endDateElem.classList.add("event__end-date");
      endDateElem.textContent = event.endDate;
        
      const actionsElem = document.createElement("td");
      actionsElem.classList.add("event__actions");

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.classList.add("event__button-edit");

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.classList.add("event__button-delete");

      actionsElem.append(editBtn, deleteBtn);
      eventElem.append(eventNameElem, startDateElem, endDateElem, actionsElem);
      this.tableBody.append(eventElem);
    }

	renderEvents(events) {
		this.tableBody.textContent = ""
		events.forEach((event) => {
			this.renderEvent(event);
		});
	}

    removeElement(element) {
        element.remove();
    }

    addEvent() {
      const eventElem = document.createElement("tr");
		  eventElem.classList.add("event");

		  const eventNameElem = document.createElement("td");
		  eventNameElem.classList.add("event__event-name");
        
      const eventNameInputElem = document.createElement("input");

		  const startDateElem = document.createElement("td");
		  startDateElem.classList.add("event__start-date");

      const startDateInputElem = document.createElement("input");
      startDateInputElem.setAttribute("type", "date");

      const endDateElem = document.createElement("td");
		  endDateElem.classList.add("event__end-date");
        
      const endDateInputElem = document.createElement("input");
      endDateInputElem.setAttribute("type", "date");
        
      const actionsElem = document.createElement("td");
      actionsElem.classList.add("event__actions");

      const saveBtn = document.createElement("button");
      saveBtn.classList.add("event__button-save-add");
      saveBtn.textContent = "Save";

      const cancelBtn = document.createElement("button");
      cancelBtn.classList.add("event__button-cancel");
      cancelBtn.textContent = "Cancel";

      eventNameElem.append(eventNameInputElem);
      startDateElem.append(startDateInputElem);
      endDateElem.append(endDateInputElem);
      actionsElem.append(saveBtn, cancelBtn);
      eventElem.append(eventNameElem, startDateElem, endDateElem, actionsElem);
      this.tableBody.append(eventElem);
    }
}
	
class EventController {
	constructor(view, model) {
		this.view = view;
		this.model = model;
		this.initialize();
	}

    initialize() {
		this.fetchEvents();
		this.setUpButtons();
    }

    fetchEvents(){
        API.getEvents().then((events) => {
            this.model.setEvents(events);
            this.view.renderEvents(events);
        })
    }

    setUpButtons() {
		this.setUpAddEventButton();
        this.setUpAddSaveButton();
        this.setUpAddCancelButton();
        this.setUpRemoveButton();
        this.setUpEditButton();
        this.setUpEditSaveButton();
	}

    setUpAddEventButton() {
        this.view.addEventButton.addEventListener("click", (e) => {
            this.view.addEvent();
        })
    }

    setUpAddSaveButton() {
        this.view.table.addEventListener("click", (e) => {
            if (e.target.classList.contains("event__button-save-add")) {
                const eventElem = e.target.parentNode.parentNode;
                const eventNameElem = eventElem.querySelector(".event__event-name");
                const startDateElem = eventElem.querySelector(".event__start-date");
                const endDateElem = eventElem.querySelector(".event__end-date");
                API.postEvent({ eventName: eventNameElem.querySelector("input").value, 
                                startDate: startDateElem.querySelector("input").value, 
                                endDate: endDateElem.querySelector("input").value})
                .then((event) => {
                    this.view.removeElement(eventElem);
                    this.view.renderEvent(event);
                    this.model.addEvent(event);
                })
            }
        })
    }

    setUpAddCancelButton() {
        this.view.table.addEventListener("click", (e) => {
            if (e.target.classList.contains("event__button-cancel")) {
                const eventElem = e.target.parentNode.parentNode;
                this.view.removeElement(eventElem);
            }
        })
    }

    setUpRemoveButton() {
        this.view.table.addEventListener("click", (e) => {
            if (e.target.classList.contains("event__button-delete")) {
                const eventElem = e.target.parentNode.parentNode;
                const id = eventElem.getAttribute("id").substring(6);
                API.removeEvent(id).then((data) => {
                    this.view.removeElement(eventElem);
                    this.model.removeEvent(id);
                })
            }
        })
    }

    setUpEditButton() {
        this.view.table.addEventListener("click", (e) => {
            if (e.target.classList.contains("event__button-edit")) {
                const eventElem = e.target.parentNode.parentNode;
                const eventNameElem = eventElem.querySelector(".event__event-name");
                const startDateElem = eventElem.querySelector(".event__start-date");
                const endDateElem = eventElem.querySelector(".event__end-date");
                const actionsElem = eventElem.querySelector(".event__actions");
                const editBtn = actionsElem.querySelector(".event__button-edit");

                const newEventNameElem = eventNameElem.cloneNode();
                const eventNameInputElem = document.createElement("input");
                eventNameInputElem.defaultValue = eventNameElem.innerHTML;

                const newStartDateElem = startDateElem.cloneNode();
                const startDateInputElem = document.createElement("input");
                startDateInputElem.setAttribute("type", "date");
                startDateInputElem.value = startDateElem.innerHTML;

                const newEndDateElem = endDateElem.cloneNode();
                const endDateInputElem = document.createElement("input");
                endDateInputElem.setAttribute("type", "date");
                endDateInputElem.value = endDateElem.innerHTML;

                newEventNameElem.append(eventNameInputElem);
                newStartDateElem.append(startDateInputElem);
                newEndDateElem.append(endDateInputElem);

                eventNameElem.replaceWith(newEventNameElem);
                startDateElem.replaceWith(newStartDateElem);
                endDateElem.replaceWith(newEndDateElem);
                
                const saveBtn = document.createElement("button");
                saveBtn.classList.add("event__button-save-edit");
                saveBtn.textContent = "Save";

                editBtn.replaceWith(saveBtn);
            }
        })
    }

    setUpEditSaveButton() {
        this.view.table.addEventListener("click", (e) => {
            if (e.target.classList.contains("event__button-save-edit")) {
                const eventElem = e.target.parentNode.parentNode;
                const eventNameElem = eventElem.querySelector(".event__event-name");
                const startDateElem = eventElem.querySelector(".event__start-date");
                const endDateElem = eventElem.querySelector(".event__end-date");
                const saveBtn = eventElem.querySelector(".event__button-save-edit");

                const id = eventElem.getAttribute("id").substring(6);
                API.editEvent(id, { eventName: eventNameElem.querySelector("input").value, 
                                    startDate: startDateElem.querySelector("input").value, 
                                    endDate: endDateElem.querySelector("input").value})
                .then((event) => {
                    const inputs = eventElem.querySelectorAll("input");
                    inputs.forEach((input) => {
                        this.view.removeElement(input);
                    })
                    eventNameElem.textContent = event.eventName;
                    startDateElem.textContent = event.startDate;
                    endDateElem.textContent = event.endDate;
                    
                    const editBtn = document.createElement("button");
                    editBtn.classList.add("event__button-edit");
                    editBtn.textContent = "Edit";

                    saveBtn.replaceWith(editBtn);

                    this.model.editEvent(id, event);
                })
            }
        })
    }
}
	
const eventView = new EventView();
const eventModel = new EventModel();
const eventController = new EventController(eventView, eventModel);