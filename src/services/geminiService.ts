// src/services/geminiService.ts
import { GoogleGenAI, type GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    console.error("Σφάλμα κατά την αρχικοποίηση του GoogleGenAI client:", error);
    ai = null; // Ensure ai is null if initialization fails
  }
} else {
  console.warn("API_KEY for Gemini is not set. AI features will be disabled.");
}

export const isAiAvailable = (): boolean => !!ai;

/**
 * Helper function to call Gemini API with retry logic.
 * @param modelName The model to use.
 * @param prompt The prompt to send.
 * @param maxRetries Maximum number of retries.
 * @param initialDelay Initial delay in ms for backoff.
 * @param isJsonExpected Whether to parse the response as JSON.
 * @returns Promise resolving to the API response text or parsed JSON, or an error message string.
 */
async function callGeminiWithRetry(
  prompt: string,
  config?: {
    maxRetries?: number;
    initialDelay?: number;
    isJsonExpected?: boolean;
    systemInstruction?: string;
  }
): Promise<any | string> {
  if (!ai) {
    return "Η υπηρεσία AI δεν είναι διαθέσιμη (λείπει το API Key).";
  }

  const { 
    maxRetries = 3, 
    initialDelay = 1000, 
    isJsonExpected = false,
    systemInstruction 
  } = config || {};
  
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
            ...(systemInstruction && { systemInstruction }),
            ...(isJsonExpected && { responseMimeType: "application/json" }),
        }
      });
      
      let responseText = response.text;
      if (!responseText || responseText.trim() === "") {
        if (attempt === maxRetries - 1) {
          return isJsonExpected ? JSON.stringify({ error: "Η υπηρεσία ΑΙ δεν παρήγαγε περιεχόμενο." }) : "Η υπηρεσία ΑΙ δεν παρήγαγε περιεχόμενο.";
        }
      } else {
        if (isJsonExpected) {
          let jsonStr = responseText.trim();
          const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
          const match = jsonStr.match(fenceRegex);
          if (match && match[2]) {
            jsonStr = match[2].trim();
          }
          try {
            return JSON.parse(jsonStr);
          } catch (parseError) {
            console.error("Σφάλμα ανάλυσης JSON από το Gemini API:", parseError, "Original text:", responseText);
            if (attempt === maxRetries - 1) {
                return JSON.stringify({ error: "Σφάλμα ανάλυσης JSON από την υπηρεσία AI.", details: responseText });
            }
            // Fall through to retry if parsing failed but text was present
          }
        }
        return responseText; // Return text if not JSON or if JSON parsing fails and it's the last attempt for text
      }
    } catch (error: any) {
      console.error(`Σφάλμα κατά την κλήση του Gemini API (προσπάθεια ${attempt + 1}/${maxRetries}):`, error);
      if (error.status === 429 || (error.status && error.status >= 500)) { // Rate limit or server error
        if (attempt === maxRetries - 1) {
          return isJsonExpected ? JSON.stringify({ error: `Σφάλμα ${error.status} από την υπηρεσία AI μετά από πολλαπλές προσπάθειες.`}) : `Σφάλμα ${error.status} από την υπηρεσία AI μετά από πολλαπλές προσπάθειες.`;
        }
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Αναμονή ${delay}ms πριν την επόμενη προσπάθεια...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else { // Non-retryable error or final attempt
        const message = error.message || "Παρουσιάστηκε ένα άγνωστο σφάλμα κατά την επικοινωνία με την υπηρεσία AI.";
        return isJsonExpected ? JSON.stringify({ error: message }) : message;
      }
    }
    attempt++;
  }
  return isJsonExpected ? JSON.stringify({error: "Ξεπεράστηκε ο μέγιστος αριθμός προσπαθειών για την υπηρεσία AI."}) : "Ξεπεράστηκε ο μέγιστος αριθμός προσπαθειών για την υπηρεσία AI.";
}


/**
 * Summarizes the provided text using the Gemini API.
 * @param textToSummarize The text to be summarized.
 * @returns A promise that resolves to the summary string, or an error message string if an error occurs or AI is unavailable.
 */
export async function summarizeTextWithGemini(textToSummarize: string): Promise<string> {
  if (!textToSummarize.trim()) {
    return "Δεν υπάρχει κείμενο για σύνοψη.";
  }
  const prompt = `Παρακαλώ συνόψισε το παρακάτω κείμενο στα Ελληνικά, με σαφήνεια και συντομία, εστιάζοντας στα βασικά σημεία. Κράτα τη σύνοψη σε 2-5 προτάσεις, αν είναι δυνατόν. Το κείμενο είναι:\n\n"${textToSummarize}"`;
  return callGeminiWithRetry(prompt);
}


// --- New AI Functions (Placeholders with Retry Logic) ---

/**
 * Categorizes a contact based on provided data using the Gemini API.
 * @param contactData Partial data of the contact (e.g., { name, email, roles }).
 * @returns A promise resolving to an array of category strings or an error message string.
 */
export async function categorizeContactWithAI(contactData: { name?: string; email?: string; roles?: string[] | readonly string[] }): Promise<string[] | string> { 
  const promptParts: string[] = [];
  if (contactData.name) promptParts.push(`Όνομα/Επωνυμία: ${contactData.name}`);
  if (contactData.email) promptParts.push(`Email: ${contactData.email}`);
  if (contactData.roles && contactData.roles.length > 0) promptParts.push(`Ρόλοι: ${contactData.roles.join(', ')}`);
  
  if (promptParts.length === 0) {
    return "Δεν υπάρχουν αρκετά δεδομένα για κατηγοριοποίηση της επαφής.";
  }

  const prompt = `Κατηγοριοποίησε την παρακάτω επαφή. Πρότεινε 1-3 σχετικές κατηγορίες (π.χ., "Δυνητικός Πελάτης", "Προμηθευτής", "Συνεργάτης", "Επενδυτής Ακινήτων", "Νομικός Σύμβουλος", "Υπηρεσία Delivery").
Εστίασε στην κύρια φύση της επαφής με βάση τα παρεχόμενα στοιχεία.
Επίστρεψε τις κατηγορίες σε μορφή JSON array από strings. Παράδειγμα: ["Κατηγορία 1", "Κατηγορία 2"]

Στοιχεία Επαφής:
${promptParts.join('\n')}
`;
  const result = await callGeminiWithRetry(prompt, { isJsonExpected: true, systemInstruction: "Είσαι ένας ευφυής βοηθός κατηγοριοποίησης επαφών CRM. Στόχος σου είναι να προτείνεις σχετικές και χρήσιμες κατηγορίες." });
  
  if (typeof result === 'string') return result; // Error string from retry helper
  if (Array.isArray(result) && result.every(item => typeof item === 'string')) return result as string[];
  if (result && result.error) return JSON.stringify(result); // Propagate JSON error string
  
  console.warn("[categorizeContactWithAI] Gemini API returned unexpected format:", result);
  return "Αποτυχία κατηγοριοποίησης επαφής: μη αναμενόμενη απόκριση.";
}

/**
 * Suggests details to complete for a contact.
 * @param contactData Partial data of the contact.
 * @returns A promise resolving to an object with suggested details or an error message string.
 */
export async function suggestContactDetails(contactData: Partial<any>): Promise<Partial<any> | string> {
  const prompt = `Πρότεινε πεδία για συμπλήρωση για την παρακάτω επαφή. Επίστρεψε ένα JSON object με τα προτεινόμενα πεδία και τιμές (π.χ., {"email": "example@example.com"}). \nΕπαφή: ${JSON.stringify(contactData)}`;
  const result = await callGeminiWithRetry(prompt, { isJsonExpected: true, systemInstruction: "Είσαι βοηθός συμπλήρωσης στοιχείων επαφών." });
  if (typeof result === 'string') return result;
  if (result && typeof result === 'object' && !Array.isArray(result)) return result as Partial<any>;
  if (result && result.error) return JSON.stringify(result);
  return "Αποτυχία πρότασης στοιχείων επαφής.";
}

/**
 * Analyzes sentiment from a list of notes.
 * @param notes An array of Note objects (only 'content' is used).
 * @returns A promise resolving to an object with sentiment analysis or an error message string.
 */
export async function analyzeSentimentFromNotes(notes: Array<{content: string}>): Promise<{ overallSentiment: string; details?: any } | string> { 
  const notesText = notes.map(note => note.content).join("\n---\n");
  if (!notesText.trim()) return "Δεν υπάρχουν σημειώσεις για ανάλυση συναισθήματος.";
  
  const prompt = `Ανάλυσε το συναίσθημα από τις παρακάτω σημειώσεις. Επίστρεψε ένα JSON object με "overallSentiment" (ένα από: "positive", "negative", "neutral") και προαιρετικά "details" με μια σύντομη αιτιολόγηση στα Ελληνικά.
Παράδειγμα απόκρισης: {"overallSentiment": "negative", "details": "Ο πελάτης εκφράζει δυσαρέσκεια για την καθυστέρηση."}

Σημειώσεις:
---
${notesText}
---
`;
  const result = await callGeminiWithRetry(prompt, { isJsonExpected: true, systemInstruction: "Είσαι ειδικός στην ανάλυση συναισθήματος κειμένου στα Ελληνικά. Προσδιόρισε το κύριο συναίσθημα." });
   if (typeof result === 'string') return result;
   if (result && result.overallSentiment && typeof result.overallSentiment === 'string') {
        const validSentiments = ['positive', 'negative', 'neutral'];
        if (validSentiments.includes(result.overallSentiment.toLowerCase())){
            return result as { overallSentiment: string; details?: any };
        } else {
            console.warn("[analyzeSentimentFromNotes] Gemini API returned an invalid sentiment value:", result.overallSentiment);
            return "Αποτυχία ανάλυσης συναισθήματος: μη έγκυρη τιμή συναισθήματος.";
        }
   }
   if (result && result.error) return JSON.stringify(result);
   return "Αποτυχία ανάλυσης συναισθήματος: μη αναμενόμενη απόκριση.";
}

/**
 * Suggests follow-up actions based on communication history.
 * @param communicationHistory An object containing notes (only 'content' is used).
 * @returns A promise resolving to an array of suggested actions (strings) or an error message string.
 */
export async function suggestFollowUpActions(communicationHistory: { notes?: Array<{content: string}> }): Promise<string[] | string> { 
  const notesContent = communicationHistory.notes?.map(n => n.content).join('\n---\n') || 'Καμία σημείωση.';
  if (!communicationHistory.notes?.length) return "Δεν υπάρχει ιστορικό επικοινωνίας για προτάσεις follow-up.";
  
  const prompt = `Με βάση τις παρακάτω σημειώσεις, πρότεινε 2-3 έξυπνες και συγκεκριμένες ενέργειες follow-up στα Ελληνικά.
Οι προτάσεις πρέπει να είναι πρακτικές και σχετικές με το περιεχόμενο των σημειώσεων.
Επίστρεψε μια λίστα από συμβουλές σε μορφή JSON array από strings. Παράδειγμα: ["Στείλτε email υπενθύμισης σχετικά με την προσφορά.", "Προγραμματίστε μια σύντομη τηλεφωνική κλήση για να συζητήσετε τις ανησυχίες του πελάτη."]

Σημειώσεις:
---
${notesContent}
---
`;
  const result = await callGeminiWithRetry(prompt, { isJsonExpected: true, systemInstruction: "Είσαι βοηθός προγραμματισμού εργασιών και follow-up. Δίνεις σαφείς και πρακτικές συμβουλές." });
  if (typeof result === 'string') return result;
  if (Array.isArray(result) && result.every(item => typeof item === 'string')) return result as string[];
  if (result && result.error) return JSON.stringify(result);
  return "Αποτυχία πρότασης ενεργειών follow-up: μη αναμενόμενη απόκριση.";
}

/**
 * Drafts a follow-up email based on call log content and contact information.
 * @param callLogContent The content of the call log note.
 * @param contactName The name of the contact for personalization.
 * @param contactEmail The email of the contact.
 * @returns A promise that resolves to the drafted email text or an error message string.
 */
export async function draftFollowUpEmailWithGemini(
  callLogContent: string,
  contactName: string,
  contactEmail?: string // Email is optional for drafting, but good to have for context
): Promise<string> {
  const prompt = `
Παρακαλώ, σύνταξε ένα επαγγελματικό και φιλικό email follow-up στα Ελληνικά, βασισμένο στην παρακάτω καταγραφή κλήσης.
Το email θα πρέπει να απευθύνεται στον/στην ${contactName}.
Στόχος είναι η σύνοψη των βασικών σημείων της κλήσης και η επιβεβαίωση τυχόν επόμενων βημάτων.

Περιεχόμενο Καταγραφής Κλήσης:
---
${callLogContent}
---

Οδηγίες για το Email:
1.  Ξεκίνα με έναν χαιρετισμό (π.χ., "Αγαπητέ/ή κ./κα. ${contactName},").
2.  Αναφέρσου στην πρόσφατη τηλεφωνική μας συνομιλία.
3.  Συνόψισε 1-3 βασικά σημεία ή συμφωνίες από την κλήση.
4.  Αν υπάρχουν επόμενα βήματα που συμφωνήθηκαν, ανέφερέ τα με σαφήνεια.
5.  Ολοκλήρωσε με έναν ευγενικό χαιρετισμό και την υπογραφή σου (π.χ., "Με εκτίμηση,\n[Το Όνομά Σου]").

Παράδειγμα Δομής:
Θέμα: Follow-up σχετικά με τη συνομιλία μας

Αγαπητέ/ή κ./κα. ${contactName},

Σε συνέχεια της τηλεφωνικής μας συνομιλίας νωρίτερα, θα ήθελα να επιβεβαιώσω τα εξής:
- [Σημείο 1]
- [Σημείο 2]

Όπως συμφωνήσαμε, τα επόμενα βήματα είναι:
- [Επόμενο Βήμα 1]

Αναμένω με ενδιαφέρον την περαιτέρω συνεργασία μας.

Με εκτίμηση,
[Το Όνομά Σου]
[Ο Τίτλος Σου]

Παρακαλώ, δημιούργησε μόνο το περιεχόμενο του email (Θέμα και κυρίως σώμα). Το θέμα πρέπει να είναι στην πρώτη γραμμή, ακολουθούμενο από "Θέμα: ".
`;

  return callGeminiWithRetry(prompt, { systemInstruction: "Είσαι ένας βοηθός σύνταξης επαγγελματικών email. Δημιουργείς πλήρη και καλογραμμένα emails." });
}