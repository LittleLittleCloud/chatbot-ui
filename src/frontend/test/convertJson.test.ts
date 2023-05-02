import { TextDavinci003, ITextDavinci003, TextDavinci003JsonConverter } from "@/model/azure/GPT";
import { Container } from "inversify";
import {IJsonConverter} from "@/utils/app/convertJson";
import { IModel } from '@/types/model';


test('adds 1 + 2 to equal 3', () => {
    expect(1+2).toBe(3);
  });

test('convert azure.text-davinci-003 to json', () => {
  let model: IModel = new TextDavinci003({apiKey: "123", resourceName: "123", deploymentID: "123"});
  var jsonSerialier = new TextDavinci003JsonConverter();
  var container = new Container();
  container.bind<IJsonConverter<ITextDavinci003>>(model.type).toConstantValue(jsonSerialier);
  var serializeProvider = container.get<IJsonConverter<IModel>>(model.type);
  var json = serializeProvider.serialize(model);
  var llm = serializeProvider.deserialize(json);
  expect(llm.type).toBe(model.type);
  expect(llm).toBeInstanceOf(TextDavinci003);
});