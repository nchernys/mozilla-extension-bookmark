function getCurrentTabUrl(callback) {
  var queryInfo = { active: true, currentWindow: true };

  browser.tabs.query(queryInfo, function (tabs) {
    var tab = tabs[0];
    var tabInfo = {
      url: tab.url,
      title: tab.title,
    };
    callback(tabInfo);
  });
}

getCurrentTabUrl(function (tabInfo) {
  document.getElementById("link").value = tabInfo.url;
  document.getElementById("title").value = tabInfo.title;
});

var main = document.querySelector(".main");
var help = document.querySelector(".help");
var helpInfo = document.querySelector(".help-container");
help.addEventListener("click", () => {
  if (helpInfo.style.display == "none") {
    helpInfo.style.display = "block";
  } else {
    helpInfo.style.display = "none";
  }
});

var all_links = [];
let all_tags = [];

async function run() {
  const storageData_display = await browser.storage.local.get("links_saved");
  const links_saved_display = storageData_display["links_saved"] || {};
  displayOnPage(links_saved_display);
  showInputTags(links_saved_display);
}

let tagField = document.querySelector(".tags-used");
let tags = document.getElementById("tags");

async function displayOnPage(links) {
  output_items.innerHTML = "";
  if (links.length === 0) {
    output_items.innerHTML = "<br><p>No messages to display yet ... </p>";
  } else {
    Object.values(links).forEach((link) => {
      let li = document.createElement("li");
      let text = `<p class="address"><a href="${link.address}">
      ${link.title} </a></p>
      <p>${link.comment}</p> ${
        link.tags !== ""
          ? `<div class="tag-div" data-tags="${link.tags}">${link.tags}</div>`
          : ""
      } <div class="remove">remove</div>`;

      li.innerHTML = text;
      output_items.appendChild(li);

      let tagDiv = li.querySelector(".tag-div");
      if (tagDiv) {
        tagDiv.addEventListener("click", () => {
          searchByTag(link.tags);
        });
      }

      let removeDiv = li.querySelector(".remove");
      removeDiv.addEventListener("click", () => {
        removeItem(link.id);
      });
    });
  }
}

var btn = document.getElementById("save");
var output_items = document.querySelector(".output_list");

btn.addEventListener("click", async () => {
  let storageData = await browser.storage.local.get("links_saved");
  all_links = storageData.links_saved || [];
  let address = document.getElementById("link").value;
  let comment = document.getElementById("description").value;
  let title = document.getElementById("title").value;
  let getTag = tags.value;
  let index = all_links.id;

  let titleExists = false;

  for (i = 0; i < all_links.length; i++) {
    if (all_links[i].title === title) {
      all_links[i] = {
        address: address,
        title: title,
        comment: comment,
        tags: getTag,
      };
      titleExists = true;
      break;
    }
  }

  if (!titleExists) {
    const index = 0 + all_links.length;
    all_links.push({
      id: index,
      address: address,
      title: title,
      comment: comment,
      tags: getTag,
    });
  }

  await browser.storage.local.set({ links_saved: all_links });
  let getLinks = await browser.storage.local.get("links_saved");
  all_links = getLinks.links_saved || [];
  displayOnPage(all_links);
  showInputTags(all_links);

  document.getElementById("description").value = "";
});

async function showInputTags(links) {
  all_tags = [];
  links.forEach((link) => {
    all_tags.push(link.tags);
  });

  function getUniqueTags(data) {
    return [...new Set(data)];
  }

  function handleTagClick(event) {
    let clickedTag = event.target.textContent;
    tags.value = clickedTag;
  }

  let uniqueTags = getUniqueTags(all_tags);

  tagField.innerHTML = "";
  for (let tag of uniqueTags) {
    if (tag !== "") {
      let tagDiv = document.createElement("div");
      tagDiv.className = "tag-div-input";
      tagDiv.textContent = tag;
      tagDiv.addEventListener("click", handleTagClick);
      tagField.appendChild(tagDiv);
    }
  }
}

async function removeItem(index) {
  const storageData = await browser.storage.local.get("links_saved");
  all_links = storageData.links_saved || [];
  const tempLinks = all_links.filter((link) => link.id !== index);
  all_links = tempLinks;
  await browser.storage.local.set({ links_saved: all_links });
  displayOnPage(all_links);
  showInputTags(all_links);
}

async function searchByTag(tag) {
  const storageData = await browser.storage.local.get("links_saved");
  all_links = storageData.links_saved || [];
  const foundLinks = [];
  all_links.forEach((link) => {
    if (link.tags === tag) {
      foundLinks.push(link);
    }
  });

  displayOnPage(foundLinks);

  main.addEventListener("click", () => {
    console.log("CLICK");
    displayOnPage(all_links);
  });
}

run();

const saveBtn = document.getElementById("save");
const tagDiv = document.querySelectorAll(".tag-div");
const removeBtn = document.querySelectorAll(".remove");

saveBtn.addEventListener("mousedown", () => {
  saveBtn.style.transform = "translateY(2px)";
});
saveBtn.addEventListener("mouseup", () => {
  saveBtn.style.transform = "translateY(0)";
});

tagDiv.forEach((tag) => {
  tag.addEventListener("mousedown", () => {
    tag.style.transform = "translateY(2px)";
  });
  tag.addEventListener("mouseup", () => {
    tag.style.transform = "translateY(0)";
  });
});

removeBtn.forEach((remove) => {
  remove.addEventListener("mousedown", () => {
    remove.style.transform = "translateY(2px)";
  });
  remove.addEventListener("mouseup", () => {
    remove.style.transform = "translateY(0)";
  });
});
