Task: Extract all text from every PDF file in the current directory and all subdirectories.

STRICT REQUIREMENTS:

1. Read every PDF page completely.

2. Extract ALL text exactly as it appears in the PDF.

3. Do NOT summarize.

4. Do NOT rephrase.

5. Do NOT correct grammar, spelling, formatting, or OCR output.

6. Do NOT omit any content.

7. Preserve:

   * Headers
   * Footers
   * Page numbers
   * Section titles
   * Question numbers
   * Tables
   * Captions
   * Mathematical formulas
   * Special symbols
   * Multiple-choice answer labels
   * Blank lines when meaningful

8. Maintain the exact original order of content.

9. For scanned PDFs:

   * Perform OCR on every page.
   * Use OCR even if selectable text already exists when OCR may recover additional content.
   * Extract text from images, diagrams, screenshots, and embedded figures whenever text is visible.

10. For MCQ questions:

    * Keep the full question text.
    * Keep question numbering exactly as written.
    * Keep all answer choices exactly as written.
    * Preserve answer labels such as:
      A) B) C) D)
      a) b) c) d)

      1. 2) 3) 4)
         or any other format used.
    * Never merge or split questions.
    * Never remove duplicated text.

11. Generate one Markdown file per PDF.

Output format:

# File: <original_pdf_name>

## Page 1

<all extracted text>

## Page 2

<all extracted text>

...

12. After processing all PDFs, generate:

extracted_questions.md

13. In extracted_questions.md:

    * Include every MCQ question from every PDF.
    * Preserve the original wording exactly.
    * Preserve answer choices exactly.
    * Preserve question numbers if present.
    * Keep questions in the same order they appear in the source PDFs.
    * Do NOT include explanations.
    * Do NOT include answers.
    * Do NOT include summaries.
    * Do NOT rewrite or normalize wording.

14. Verification pass:

    * Re-read every generated Markdown file.
    * Compare against the source PDF.
    * Ensure no page is missing.
    * Ensure no question is missing.
    * Ensure no answer choice is missing.
    * Ensure page counts match the original PDFs.

Goal:
Create a 100% faithful textual reproduction of all exam PDFs so the content can later be analyzed statistically and used for exam-pattern extraction.
