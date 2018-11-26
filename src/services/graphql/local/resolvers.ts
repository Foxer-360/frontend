import { ApolloCache } from 'apollo-cache';

interface ICache {
  // tslint:disable-next-line:no-any
  cache: ApolloCache<any>;
}
// tslint:disable:object-literal-sort-keys
export const resolvers = {
  Mutation: {
    setWebsite: (_: never, { website }: LooseObject, { cache }: ICache): void => {
      // tslint:disable-next-line:no-console
      console.log(website);
      cache.writeData({ data: { website } });
    },
    setLanguage: (_: never, { language }: LooseObject, { cache }: ICache): void => {
      // tslint:disable-next-line:no-console
      console.log(language);
      cache.writeData({ data: { language } });
    },
    setPage: (_: never, { page }: LooseObject, { cache }: ICache): void => {
      // tslint:disable-next-line:no-console
      console.log(page);
      cache.writeData({ data: { page } });
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
