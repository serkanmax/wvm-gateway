import { IResolvers } from '@graphql-tools/utils';
import { GqlTransaction } from '../../types.js';
import ArModule from 'arweave/node/ar.js';

/* eslint-disable */
// @ts-ignore
const { default: Ar } = ArModule;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export function getPageSize({ first }: { first?: number }) {
  return Math.min(first || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
}

const ar = new Ar();

function winstonToAr(amount: string) {
  return ar.winstonToAr(amount);
}

export function resolveTxRecipient(tx: GqlTransaction) {
  if (tx.recipient) {
    return tx.recipient;
  } else {
    return '';
  }
}

export function resolveTxData(tx: GqlTransaction) {
  return {
    size: tx.dataSize || '0',
    type: tx.contentType
  };
}

export function resolveTxQuantity(tx: GqlTransaction) {
  return {
    ar: winstonToAr(tx.quantity || '0'),
    winston: tx.quantity || '0'
  };
}

export function resolveTxFee(tx: GqlTransaction) {
  return {
    ar: winstonToAr(tx.fee || '0'),
    winston: tx.fee || '0'
  };
}

export function resolveTxOwner(tx: GqlTransaction) {
  return {
    address: tx.ownerAddress,
    key: tx.ownerKey
  };
}

// TODO implement
export function resolveTxParent(_tx: GqlTransaction) {
  return {
    id: ''
  };
}

// TODO implement
export function resolveTxBundledIn(_tx: GqlTransaction) {
  return {
    id: ''
  };
}

export const resolvers: IResolvers = {
  Query: {
    transaction: async (_, queryParams, { db }) => {
      return await db.getGqlTransaction({
        id: queryParams.id
      });
    },
    transactions: (_, queryParams, { db }) => {
      return db.getGqlTransactions({
        pageSize: getPageSize(queryParams),
        sortOrder: queryParams.sort,
        cursor: queryParams.after,
        ids: queryParams.ids,
        recipients: queryParams.recipients,
        owners: queryParams.owners,
        tags: queryParams.tags || [],
        minHeight: queryParams.block?.min,
        maxHeight: queryParams.block?.max
      });
    },
    block: async (_, queryParams, { db }) => {
      return await db.getGqlBlock({
        id: queryParams.id
      });
    },
    blocks: (_, queryParams, { db }) => {
      return db.getGqlBlocks({
        pageSize: getPageSize(queryParams),
        sortOrder: queryParams.sort,
        cursor: queryParams.after,
        ids: queryParams.ids,
        minHeight: queryParams.height?.min,
        maxHeight: queryParams.height?.max
      });
    }
  },
  Transaction: {
    block: (parent: GqlTransaction) => {
      return parent.blockIndepHash
        ? {
            id: parent.blockIndepHash,
            timestamp: parent.blockTimestamp,
            height: parent.height,
            previous: parent.blockPreviousBlock
          }
        : null;
    },
    recipient: resolveTxRecipient,
    data: resolveTxData,
    quantity: resolveTxQuantity,
    fee: resolveTxFee,
    owner: resolveTxOwner,
    parent: resolveTxParent,
    bundledIn: resolveTxBundledIn
  }
};