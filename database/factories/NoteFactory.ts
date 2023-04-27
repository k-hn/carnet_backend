import Note from 'App/Models/Note'
import Factory from '@ioc:Adonis/Lucid/Factory'

export default Factory.define(Note, ({ faker }) => {
  return {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs()
  }
}).build()
