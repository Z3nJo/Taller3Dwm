from abc import ABC, abstractmethod

class ICRUD(ABC):

    @abstractmethod
    async def create(self, obj): pass

    @abstractmethod
    async def get(self, id): pass

    @abstractmethod
    async def update(self, id, obj): pass

    @abstractmethod
    async def delete(self, id): pass

    @abstractmethod
    async def query(self, filter): pass
