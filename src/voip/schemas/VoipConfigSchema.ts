// src/voip/schemas/VoipConfigSchema.ts
import { z } from 'zod';

// Βασικό σχήμα για όλους τους adapters
export const BaseAdapterConfigSchema = z.object({
  systemName: z.string().min(1, { message: "Το όνομα του συστήματος είναι υποχρεωτικό." }),
  isEnabled: z.boolean().default(true).describe("Καθορίζει αν ο adapter είναι ενεργοποιημένος."),
  displayName: z.string().optional().describe("Φιλικό όνομα για εμφάνιση στο UI."),
});
export type BaseAdapterConfig = z.infer<typeof BaseAdapterConfigSchema>;

// Σχήμα για τον MockAdapter
export const MockAdapterConfigSchema = BaseAdapterConfigSchema.extend({
  systemName: z.literal('mock'),
  simulateDelayMs: z.number().int().positive().optional().default(500).describe("Καθυστέρηση σε ms για προσομοίωση λειτουργιών."),
  mockValue: z.string().optional().describe("Παράδειγμα επιπλέον ρύθμισης για τον MockAdapter.")
});
export type MockAdapterConfig = z.infer<typeof MockAdapterConfigSchema>;

// Placeholder σχήμα για έναν TwilioAdapter (παράδειγμα)
export const TwilioAdapterConfigSchema = BaseAdapterConfigSchema.extend({
  systemName: z.literal('twilio'),
  accountSid: z.string().startsWith('AC', { message: "Το Account SID του Twilio πρέπει να αρχίζει με AC." }),
  authToken: z.string().min(30, { message: "Το Auth Token του Twilio φαίνεται πολύ μικρό." }),
  fromNumber: z.string().min(1, { message: "Ο αριθμός αποστολέα (From Number) είναι υποχρεωτικός." }),
});
export type TwilioAdapterConfig = z.infer<typeof TwilioAdapterConfigSchema>;

// Placeholder σχήμα για έναν AsteriskAmiAdapter (παράδειγμα)
export const AsteriskAmiAdapterConfigSchema = BaseAdapterConfigSchema.extend({
  systemName: z.literal('asterisk-ami'),
  host: z.string().min(1, { message: "Το host του Asterisk AMI είναι υποχρεωτικό." }),
  port: z.number().int().positive().default(5038),
  username: z.string().min(1, { message: "Το username για το Asterisk AMI είναι υποχρεωτικό." }),
  secret: z.string().min(1, { message: "Το secret (password) για το Asterisk AMI είναι υποχρεωτικό." }),
});
export type AsteriskAmiAdapterConfig = z.infer<typeof AsteriskAmiAdapterConfigSchema>;


// Discriminated union για τις ρυθμίσεις των adapters
export const AdapterConfigUnionSchema = z.discriminatedUnion('systemName', [
  MockAdapterConfigSchema,
  TwilioAdapterConfigSchema, // Προσθήκη για μελλοντική χρήση
  AsteriskAmiAdapterConfigSchema, // Προσθήκη για μελλοντική χρήση
  // ... Προσθέστε εδώ schemas για άλλους adapters καθώς υλοποιούνται
]);
export type AdapterConfigUnion = z.infer<typeof AdapterConfigUnionSchema>;


// Κύριο σχήμα για τις γενικές ρυθμίσεις του VoIP module
export const GlobalVoipConfigSchema = z.object({
  enableVoipFeatures: z.boolean().default(true).describe("Ενεργοποίηση/Απενεργοποίηση όλων των λειτουργιών VoIP."),
  defaultAdapterSystemName: z.string().optional().describe("Το systemName του προεπιλεγμένου adapter που θα χρησιμοποιείται αν δεν οριστεί άλλος."),
  adapters: z.array(AdapterConfigUnionSchema).default([]).describe("Λίστα με τις ρυθμίσεις των διαθέσιμων adapters."),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info').describe("Επίπεδο καταγραφής για το VoIP module."),
  // Άλλες global ρυθμίσεις μπορούν να προστεθούν εδώ, π.χ.:
  // defaultCountryCodeForDialing: z.string().optional().default('+30'),
  // autoOpenDialPadOnIncomingCall: z.boolean().default(true),
});
export type GlobalVoipConfig = z.infer<typeof GlobalVoipConfigSchema>;


// Παράδειγμα χρήσης (δεν είναι μέρος του schema, απλά για επίδειξη):
/*
const exampleConfig: GlobalVoipConfig = {
  enableVoipFeatures: true,
  defaultAdapterSystemName: 'mock',
  adapters: [
    {
      systemName: 'mock',
      isEnabled: true,
      displayName: 'Mock VoIP Provider',
      simulateDelayMs: 750,
    },
    {
        systemName: 'twilio',
        isEnabled: false,
        displayName: 'Twilio Cloud Communications',
        accountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        authToken: 'your_twilio_auth_token_here_xxxx',
        fromNumber: '+1234567890'
    }
  ],
  logLevel: 'debug',
};

const validationResult = GlobalVoipConfigSchema.safeParse(exampleConfig);
if (validationResult.success) {
  console.log("Global VoIP Config is valid:", validationResult.data);
} else {
  console.error("Global VoIP Config validation errors:", validationResult.error.flatten());
}
*/
