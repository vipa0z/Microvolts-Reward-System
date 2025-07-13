const fs = require('fs');
const path = require('path');

// Load input files
const itemsFilePath = path.join(__dirname, 'itemsInfoUnlimitedCleaned.json');
const iconsFilePath = path.join(__dirname, 'iconsInfo.json');

// Load and parse JSON
const itemsData = JSON.parse(fs.readFileSync(itemsFilePath, 'utf8'));
const iconsData = JSON.parse(fs.readFileSync(iconsFilePath, 'utf8'));

// Create a lookup map from ii_id to icon entry for fast access
const iconMap = new Map();
for (const icon of iconsData) {
  iconMap.set(icon.ii_id, icon);
}

// Update items with ii_filename from matching icons
const updatedItems = itemsData.map(item => {
  const iconId = item.ii_iconsmall;
  const iconEntry = iconMap.get(iconId);
  if (iconEntry) {
    item.ii_icon_filename = iconEntry.ii_filename;
    item.offset = iconEntry.ii_offset,
    item.width = iconEntry.ii_width,
    item.height = iconEntry.ii_height,
    item.filesize = iconEntry.ii_filesize,
    item.common = iconEntry.ii_common
  } else {
    item.ii_icon_filename = null; // or leave it out
  }
  return item;
});

// Write updated items to a new file
const outputFilePath = path.join(__dirname, 'itemsInfo_with_icons.json');
fs.writeFileSync(outputFilePath, JSON.stringify(updatedItems, null, 2));

console.log(`✅ itemsInfo_with_icons.json has been generated with icon filenames.`);
