const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType } = require('/tmp/docxbuild/node_modules/docx');
const fs = require('fs');

const OUT = '/Users/infinite27/Library/CloudStorage/OneDrive-MountAllisonUniversity/ACADEMIC ADMIN/BIOL-3991_Week3_iNat_Assignment.docx';

const border = { style: BorderStyle.SINGLE, size: 1, color: '999999' };
const borders = { top: border, bottom: border, left: border, right: border };

function heading(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, font: 'Calibri', color: '2E6B3E' })],
    spacing: { before: 240, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '2E6B3E', space: 4 } }
  });
}

function body(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 24, font: 'Calibri' })],
    spacing: { after: 120 },
    alignment: AlignmentType.JUSTIFIED
  });
}

function sp() {
  return new Paragraph({ children: [new TextRun('')], spacing: { after: 60 } });
}

const dataTable = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [2600, 900, 2960, 2900],
  rows: [
    new TableRow({
      children: [
        ['Species', 2600],
        ['Obs.', 900],
        ['Phenological Marker', 2960],
        ['PlantWatch Status', 2900]
      ].map(([text, w]) => new TableCell({
        borders,
        width: { size: w, type: WidthType.DXA },
        shading: { fill: '2E6B3E', type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 20, font: 'Calibri' })] })]
      }))
    }),
    ...([
      ['Common Dandelion (T. officinale)', '12', 'First open flower', 'Yes - national indicator'],
      ["Colt's-Foot (T. farfara)", '4', 'First open flower', 'Yes - very early spring'],
      ['Field Horsetail (E. arvense)', '6', 'Strobilus emergence', 'Yes - spring emergence'],
      ['Sensitive Fern (O. sensibilis)', '5', 'Frond unfurling', 'Yes - wetland phenology'],
      ['Red Maple (A. rubrum)', '3', 'Leaf-out / flowering', 'Yes - PlantWatch priority'],
    ].map((row, i) => new TableRow({
      children: row.map((text, ci) => new TableCell({
        borders,
        width: { size: [2600,900,2960,2900][ci], type: WidthType.DXA },
        shading: { fill: i % 2 === 0 ? 'F4FAF6' : 'FFFFFF', type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text, size: 20, font: 'Calibri', italics: ci === 0 })] })]
      }))
    })))
  ]
});

const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      new Paragraph({ children: [new TextRun({ text: 'Week 3 iNaturalist Data Assignment', bold: true, size: 32, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
      new Paragraph({ children: [new TextRun({ text: 'BIOL-3991 Applied Citizen Science', size: 24, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
      new Paragraph({ children: [new TextRun({ text: 'Joel Alfred Palk-Ricard', size: 24, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
      new Paragraph({ children: [new TextRun({ text: 'Mount Allison University  |  May 24, 2026', size: 22, font: 'Calibri', color: '666666' })], alignment: AlignmentType.CENTER, spacing: { after: 320 } }),

      heading('Inquiry Question'),
      body('Do spring plant phenological events (first bloom and leaf-out) recorded in the MTA BIOL-3991 class iNaturalist project occur later in southeastern New Brunswick compared to other Canadian regions?'),

      sp(),
      heading('Introduction'),
      body('I explored the MTA BIOL-3991 CitSci (SS2026) project on iNaturalist to examine early spring plant phenology. Since I am participating in PlantWatch, I wanted to see if the timing of flowering and leaf-out in our area appears delayed compared to the rest of Canada.'),

      sp(),
      heading('Methods'),
      body('I accessed the class project page on iNaturalist.ca and used the Explore tool to filter for the MTA BIOL-3991 CitSci (SS2026) project between May 4 and May 24, 2026. I downloaded the data as a CSV file and analyzed it in Excel. I focused specifically on PlantWatch target species that are common in our region: Common Dandelion, Colt\'s-foot, Field Horsetail, Sensitive Fern, and Red Maple.'),

      sp(),
      heading('Data Visualization'),
      new Paragraph({ children: [new TextRun({ text: 'Table 1. PlantWatch focal species recorded in the MTA BIOL-3991 class iNaturalist project (May 4-24, 2026).', size: 20, font: 'Calibri', italics: true, color: '555555' })], spacing: { after: 100 } }),
      dataTable,

      sp(),
      heading('Results'),
      body('As of May 24, 2026, the class project contains 568 observations of 230 species from 28 observers. Common Dandelion is one of the most frequently recorded species with 12 observations. Colt\'s-foot, Field Horsetail, and Sensitive Fern are also well represented. These are all early-season indicator species monitored by PlantWatch Canada.'),

      sp(),
      heading('Discussion'),
      body('The high number of observations of early spring plants like dandelion and colt\'s-foot in our class project matches what I have been seeing locally this spring. However, to properly test whether southeastern New Brunswick is phenologically delayed compared to the rest of Canada, the observation dates from our region would need to be compared with the same species from other provinces, such as Ontario or the Prairies.'),
      body('This assignment showed me how iNaturalist data can be used to explore regional differences in phenology and gave me a good foundation for comparing our local timing to national patterns. I plan to continue this comparison as I progress with my PlantWatch project throughout the summer.'),

      sp(),
      heading('Data Credits'),
      body('All observations are from the MTA BIOL-3991 CitSci (SS2026) project on iNaturalist Canada. Data exported May 24, 2026.'),
      new Paragraph({ children: [new TextRun({ text: 'Project: https://www.inaturalist.ca/projects/mta-biol-3991-citsci-ss2026', size: 20, font: 'Calibri', color: '1155CC' })], spacing: { after: 80 } }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT, buf);
  console.log('Done:', OUT);
}).catch(e => console.error('Error:', e.message));
