import { buildSchema } from 'graphql';

export const schema = buildSchema(`
  type Site {
    id: ID!
    name: String!
    sector: String!
    district: String!
    operator: String!
    safety_rating: Float
    total_workers: Int
  }

  type Worker {
    id: ID!
    worker_code: String!
    full_name: String!
    tribal_language: String!
    literacy_level: String!
    designation: String!
    phone: String
    joined_date: String
    site: Site
    certificates: [Certificate]
  }

  type Certificate {
    id: ID!
    certificate_id: String!
    score: Int!
    issue_date: String!
    expiry_date: String!
    qr_hash: String!
    signature: String!
    module_title: String
    worker_name: String
    compliance_status: String
  }

  type ComplianceOverview {
    workersTrained: Int!
    module1PassRate: Int!
    sitesOnboarded: Int!
    certsValidTodayPercent: Int!
    certsExpiringWarning: Int!
  }

  type Query {
    complianceOverview: ComplianceOverview
    complianceSummary: ComplianceOverview
    sites(sector: String, district: String): [Site]
    workers(siteId: String, search: String): [Worker]
    worker(id: String!): Worker
    verifyCertificate(hashOrId: String!): Certificate
  }
`);
