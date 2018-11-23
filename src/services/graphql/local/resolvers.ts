import { ApolloCache } from 'apollo-cache';

interface IdVar {
  id: string;
}

interface ICache {
  // tslint:disable-next-line:no-any
  cache: ApolloCache<any>;
}
// tslint:disable:object-literal-sort-keys
export const resolvers = {
  Mutation: {
    setProject: (_: never, { id }: IdVar, { cache }: ICache): void => {
      cache.writeData({ data: { project: id }});
    },
    setWebsite: (_: never, { id }: IdVar, { cache }: ICache): void => {
      cache.writeData({ data: { website: id } });
    },

    setLanguage: (_: never, { id }: IdVar, { cache }: ICache): void => {
      cache.writeData({ data: { language: id } });
    },
    setPage: (_: never, { id }: IdVar, { cache }: ICache): void => {
      cache.writeData({ data: { page: id } });
    },
    resetProject: (_: never, __: never, { cache }: ICache): void => {
      cache.writeData({ data: { project: null } });
    },
    resetWebsite: (_: never, __: never, { cache }: ICache): void => {
      cache.writeData({ data: { website: null } });
    },
    resetPage: (_: never, __: never, { cache }: ICache): void => {
      cache.writeData({ data: { page: null } });
    },
    resetLanguage: (_: never, __: never, { cache }: ICache): void => {
      cache.writeData({ data: { language: null } });
    },

  }
};
