import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {faker} from "@faker-js/faker";

admin.initializeApp();
const db = admin.firestore();
const companies = db.collection("companies");

/**
 * Generate a random number of fake companies (1-100)
 * and store them in the collection 'companies' in Firestore.
 *
 * _Calls Firestore in the configured project._
 *
 * _Assumes you have created a collection called 'companies'
 * in region 'europe-west1'_
 */
export const createCompanies =
    functions.region("europe-west1")
        .https.onCall(
            async function() {
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
 * Calls Firestore in the configured project.
 * Assumes you have created a collection called 'companies'
 * in region 'europe-west1'
 * @param string - id the document id of the company
 * @return object - jsObject representing a company.
 */
export const getCompanies =
    functions.region("europe-west1")
        .https.onCall(
            async function() {
              const snapshot = await companies.select("ID", "name").get();
              if (snapshot.empty) {
                console.log("No matching documents.");
                return {data: {}};
              }
              // FIXME: We should have some types here.
              //  Implicit typing becomes so verbose
              const companyList: { id: string; name: string; }[] = [];
              snapshot.forEach((company: { id: string; data: () => any; }) => {
                companyList.push({id: company.id, name: company.data().name});
                console.log(company.id, "=>", company.data());
              });
              return companyList;
            });
/**
 * Fetch a company from firestore using its id.
 * Calls Firestore in the configured project.
 * Assumes you have created a collection called 'companies'
 * in region 'europe-west1'
 * @param string - id the document id of the company
 * @return List<object> - List of jsObjects representing
 * all companies in collection.
 */
export const getCompany =
    functions.region("europe-west1")
        .https.onCall(
            async function(data) {
              const resultRef = await companies.doc(<string>data.id);

              const doc = await resultRef.get();

              if (!doc.exists) {
                return {data: {}};
              }

              return doc.data();
            });

// eslint-disable-next-line valid-jsdoc
/**
 * Generates a valid company payload with realistic
 * values. Data is generated using @faker-js/faker.
 */
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

// eslint-disable-next-line valid-jsdoc
/**
 * Generates a valid uuid. Data is generate
 * using @faker-js/faker.
 */
const generateUuid = () => {
  return faker.datatype.uuid();
};
