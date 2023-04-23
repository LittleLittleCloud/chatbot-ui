import { TextDavinci003, ITextDavinci003, TextDavinci003JsonConverter } from "@/model/azure/GPT";
import { Container } from "inversify";
import {IJsonConverter} from "@/utils/app/convertJson";
import { IModelMetaData } from "@/model/type";

test('adds 1 + 2 to equal 3', () => {
    expect(1+2).toBe(3);
  });

test('convert azure.text-davinci-003 to json', () => {
  let model: IModelMetaData = new TextDavinci003({apiKey: "123", resourceName: "123", deploymentID: "123"});
  var jsonSerialier = new TextDavinci003JsonConverter();
  var container = new Container();
  container.bind<IJsonConverter<ITextDavinci003>>(model.id).toConstantValue(jsonSerialier);
  var serializeProvider = container.get<IJsonConverter<IModelMetaData>>(model.id);
  var json = serializeProvider.serialize(model);
  var llm = serializeProvider.deserialize(json);
  expect(llm.id).toBe(model.id);
  expect(llm).toBeInstanceOf(TextDavinci003);
});