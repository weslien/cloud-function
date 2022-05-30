import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {faker} from "@faker-js/faker";

admin.initializeApp();
const db = admin.firestore();
const companies = db.collection("companies");

/**
 * Create a set of companies from random noise
 */
export const createCompanies =
    functions.region("europe-west1")
        .https.onCall(
            async function(data, context) {
              // Generate a random number of companies between 1 and 100
              for (
                let i = 0;
                i < faker.datatype.number({min: 1, max: 100});
                i++) {
                const company = generateCompany();
                const uuid = generateUuid();
                await companies.doc(uuid).set(company);
                // eslint-disable-next-line max-len
                console.log(`Created company ${JSON.stringify(company)} with id ${uuid}`);
              }
              return {data: "successful!"};
            });

/**
 * Get id, name, for all companies
 */
export const getCompanies =
    functions.region("europe-west1")
        .https.onCall(
            async function(data, context) {
              const snapshot = await companies.select("ID", "name").get();
              if (snapshot.empty) {
                console.log("No matching documents.");
                return {data: {}};
              }
              // Build resultset
              const companyList: { id: string; name: string; }[] = [];
              snapshot.forEach((company: { id: string; data: () => any; }) => {
                companyList.push({id: company.id, name: company.data().name});
                console.log(company.id, "=>", company.data());
              });
              return companyList;
            });

export const getCompany =
    functions.region("europe-west1")
        .https.onCall(
            async function(data, context) {
              const resultRef = await companies.doc(<string>data.id);

              const doc = await resultRef.get();

              if (!doc.exists) {
                return {data: {}};
              }

              return doc.data();
            });


const generateCompany = () => {
  return {
    name: faker.company.companyName(),
    industry: faker.company.bsBuzz(),
    address1: faker.address.streetAddress(),
    address2: faker.address.secondaryAddress(),
    city: faker.address.city(),
    zip: faker.address.zipCode(),
    employees: faker.datatype.number(25000),
  };
};

const generateUuid = () => {
  return faker.datatype.uuid();
};
