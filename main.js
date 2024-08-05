"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function vndbSearch(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const form = document.getElementById('vndb-form');
        if (form == null)
            return;
        const formData = new FormData(form);
        const username = formData.get('vndb-username');
        const usernameInput = document.getElementById('username-input');
        if (usernameInput == null)
            return;
        if (username.length <= 0) {
            usernameInput.classList.add('border-red-300');
            return;
        }
        let filterList = [];
        for (const pair of formData.entries()) {
            if (pair[0].startsWith("filter-")) {
                filterList.push(pair[1]);
            }
        }
        let id = '';
        if (/^(u[0-9]*)$/.test(username)) {
            id = username;
        }
        else {
            id = yield vndbGetIDFromUsername(username);
        }
        if (id == null) {
            usernameInput.classList.add('border-red-300');
            return;
        }
        let vns = yield vndbGetUList(id, filterList);
        if (vns == null) {
            usernameInput.classList.add('border-red-300');
            return;
        }
        usernameInput.classList.remove('border-red-300');
        let gamesContainer = document.getElementById('vndb-games');
        if (gamesContainer == null)
            return;
        gamesContainer.innerHTML = '';
        let playtime = 0;
        for (const vn of vns) {
            gamesContainer.innerHTML += vnGetHTMLTemplate(vn.vn.title, vn.vn.length_minutes, vn.vn.image.url);
            playtime += vn.vn.length_minutes;
        }
        const playtimeText = document.getElementById('text-playtime');
        if (playtimeText == null)
            return;
        playtimeText.innerText = formatPlaytime(playtime);
    });
}
function vndbGetIDFromUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield fetch('https://api.vndb.org/kana/user?q=' + encodeURIComponent(username));
        if (result.status != 200)
            return null;
        const user = yield result.json();
        return user[username].id;
    });
}
function vndbGetUList(id, filterList) {
    return __awaiter(this, void 0, void 0, function* () {
        let vns = [];
        let page = 1;
        const PAGE_SIZE = 16;
        while (true) {
            const result = yield fetch('https://api.vndb.org/kana/ulist', {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({
                    user: id,
                    page: page,
                    filters: filterListToJSON(filterList),
                    fields: 'id, vn.title, vn.length_minutes, vn.image.url',
                    results: PAGE_SIZE
                })
            });
            if (result.status != 200)
                return null;
            let page_result = yield result.json();
            vns.push(...page_result.results);
            if (!page_result.more)
                break;
            page += 1;
        }
        return vns;
    });
}
function filterListToJSON(filterList) {
    let filterParam = ["or"];
    for (const filter of filterList) {
        filterParam.push(["label", "=", filter]);
    }
    return JSON.stringify(filterParam);
}
function vnGetHTMLTemplate(title, playtimeInMinutes, imageURL) {
    return `<div class="grid grid-cols-1">
                <div class="justify-center text-center mx-auto">
                    <img class="p-1 w-auto h-32 aspect-auto" src="${imageURL}" alt="${title} cover">
                </div>
                <div class="ml-5 p-1">
                    <h1 class="font-medium">${title}</h1>
                    <h3 class="font-light text-sm text-gray-500">${formatPlaytime(playtimeInMinutes)}</h3>
                </div>
            </div>`;
}
function formatPlaytime(playtimeInMinutes) {
    let hours = Math.floor(playtimeInMinutes / 60);
    let minutes = Math.floor(playtimeInMinutes % 60);
    return `${hours}h ${minutes}m`;
}
function openDropdown(id) {
    const dropdown = document.getElementById(id);
    if (dropdown == null)
        return;
    if (dropdown.classList.contains("hidden")) {
        dropdown.classList.remove("hidden");
    }
    else {
        dropdown.classList.add("hidden");
    }
}
// Add event listener for dropdown
function registerDropdownHandler(buttonID, bodyID) {
    var _a;
    (_a = document.getElementById(buttonID)) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function (event) {
        event.stopPropagation();
        const dropdownButton = document.getElementById(buttonID);
        const dropdownBody = document.getElementById(bodyID);
        if (dropdownButton == null || dropdownBody == null)
            return;
        if (!dropdownBody.classList.contains('hidden') && !dropdownButton.contains(event.target) && !dropdownBody.contains(event.target)) {
            dropdownBody.classList.add('hidden');
        }
    });
    document.addEventListener('click', function (event) {
        const dropdownButton = document.getElementById(buttonID);
        const dropdownBody = document.getElementById(bodyID);
        if (dropdownButton == null || dropdownBody == null)
            return;
        if (!dropdownBody.classList.contains('hidden') && !dropdownButton.contains(event.target) && !dropdownBody.contains(event.target)) {
            dropdownBody.classList.add('hidden');
        }
    });
}
registerDropdownHandler('filter-dropdown', 'filter-dropdown-div');
